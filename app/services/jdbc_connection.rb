class JdbcConnection < DataSourceConnection
  class DatabaseError < Error

    def error_type
      return @error_type if @error_type
      log_error
      @error_type = :JDBC_ERROR
    end

    private

    def sanitize_message(message)
      message[0, 300]
    end

    def log_error
      error_code = @exception.wrapped_exception && @exception.wrapped_exception.respond_to?(:get_error_code) && @exception.wrapped_exception.get_error_code
      Rails.logger.error "JDBC error code = #{error_code}"
      Rails.logger.error @exception.message
    end
  end

  module MariaOverrides
    def schemas
      with_connection do |connection|
        ss = []
        connection.process_metadata(:getCatalogs) do |h|
          ss << h[:table_cat] unless @schema_blacklist.include?(h[:table_cat])
        end
        ss
      end
    end

    def metadata_for_dataset(dataset_name)
      column_count = with_connection do |connection|
        connection.to_enum(:process_metadata, :getColumns, schema_name, nil, dataset_name, nil).count
      end
      {:column_count => column_count}
    end

    private

    def metadata_get_tables(types, opts, &block)
      with_connection do |connection|
        connection.process_metadata(:getTables, opts[:schema], opts[:schema], opts[:table_name], types.to_java(:string), &block)
      end
    end
  end

  def initialize(data_source, account, options)
    super
    self.extend(MariaOverrides) if /jdbc:mariadb:/ =~ db_url
  end

  def db_url
    @data_source.url
  end

  def db_options
    super.merge :identifier_output_method => nil
  end

  def connect!
    super
    @connection.extension :jdbc_metadata
    @connection
  end

  def version
    with_connection { |connection| connection.get_metadata(:getDatabaseProductVersion) }.slice(0,255)
  end

  def schemas
    with_connection do |connection|
      ss = []
      connection.process_metadata(:getSchemas){ |h| ss << h[:table_schem] unless @schema_blacklist.include?(h[:table_schem])}
      ss
    end
  end

  def schema_exists?(name)
    schemas.include? name
  end

  def table_exists?(name)
    object_exists? JDBC_TYPES[:tables], name
  end

  def view_exists?(name)
    object_exists? JDBC_TYPES[:views], name
  end

  def datasets(options={})
    res = []
    name_matcher = Regexp.compile(Regexp.escape(options[:name_filter]), Regexp::IGNORECASE) if options[:name_filter]
    count = 0
    metadata_get_tables(JDBC_TYPES[:datasets], options.merge(:schema => schema_name)) do |h|
      break if options[:limit] && count >= options[:limit]
      unless name_matcher && name_matcher !~ h[:table_name]
        count += 1
        res << {:name => h[:table_name], :type => table_type?(h[:table_type])}
      end
    end
    res
  end

  def datasets_count(options={})
    # TODO: this is pretty egregious, loads all the datasets...
    datasets(options).size
  end

  def metadata_for_dataset(dataset_name)
    column_count = with_connection { |connection| connection.schema(dataset_name, {:schema => schema_name}).size }
    {:column_count => column_count}
  end

  def column_info(dataset_name, setup_sql)
    with_connection do |connection|
      connection.schema(dataset_name, {:schema => schema_name}).map do |col|
        { :attname => col[0].to_s, :format_type => col[1][:db_type] }
      end
    end
  end

  def create_sql_result(warnings, result_set)
    JdbcSqlResult.new(:warnings => warnings, :result_set => result_set)
  end

  def self.error_class
    JdbcConnection::DatabaseError
  end

  def visualization_sql_generator
    params = { :limit => :top, :numeric_cast => 'numeric(32)' }
    sql_gen = Visualization::SqlGenerator.new(params).extend(Visualization::JdbcSql)
    sql_gen.extend(Visualization::TeradataSql) if /jdbc:teradata:/ =~ db_url
    sql_gen.extend(Visualization::SqlServerSql) if /jdbc:sqlserver:/ =~ db_url
    sql_gen
  end

  private

  JDBC_TYPES = {
      :tables => %w(TABLE),
      :views => %w(VIEW),
      :datasets => %w(TABLE VIEW)
  }

  def schema_name
    @options[:schema]
  end

  def object_exists?(types, name)
    return false unless name
    ts = []
    metadata_get_tables(types, :schema => schema_name, :table_name => name) do |h|
      ts << h[:table_name]
    end
    ts.include? name
  end

  def table_type?(type)
    case type
      when 'TABLE', 'BASE TABLE' then 't'
      when 'VIEW', 'SYSTEM VIEW' then 'v'
      else nil
    end
  end

  def metadata_get_tables(types, opts, &block)
    with_connection do |connection|
      connection.process_metadata(:getTables, nil, opts[:schema], opts[:table_name], types.to_java(:string), &block)
    end
  end

  def load_schema_blacklist
    type = /\Ajdbc:([^:]+)/.match(db_url).try(:[], 1).try(:to_sym)
    ChorusConfig.instance.jdbc_schema_blacklists[type]
  end
end
