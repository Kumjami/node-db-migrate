var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var config = require('../lib/config');
var path = require('path');

var _configLoad = config.load;
var _configLoadUrl = config.loadUrl;

lab.experiment('config', function() {

  lab.experiment('loading from a file', { parallel: true },
    function() {

    var configPath = path.join(__dirname, 'database.json');
    var _config = config.load(configPath, 'dev');

    lab.test('should export all environment settings', { parallel: true },
      function (done) {

      Code.expect(_config.dev).to.exists();
      Code.expect(_config.test).to.exists();
      Code.expect(_config.prod).to.exists();
      done();
    });

    lab.test('should export a getCurrent function with all current ' +
      'environment settings', { parallel: true }, function (done) {

      var current;
      Code.expect(_config.getCurrent).to.exists();
      current = _config.getCurrent();
      Code.expect(current.env).to.equal('dev');
      Code.expect(current.settings.driver).to.equal('sqlite3');
      Code.expect(current.settings.filename).to.equal(':memory:');
      done();
    });
  });

  lab.experiment('loading from a broken config file', { parallel: true },
    function() {

    var configPath = path.join(__dirname, 'database_with_syntax_error.json');

    lab.test('should throw a syntax error', { parallel: true },
      function (done) {

      Code.expect(
        config.load.bind(this, configPath, 'dev'),
        'Expected broken file to produce syntax error'
      ).to.throw(SyntaxError);
      done();
    });
  });

  lab.experiment('loading from a file with default env option',
    { parallel: true }, function() {

    var configPath = path.join(__dirname, 'database_with_default_env.json');
    var _config = config.load(configPath);

    lab.test('should load a value from the default env', { parallel: true },
      function (done) {

      var current = _config.getCurrent();
      Code.expect(current.env).to.equal('local');
      Code.expect(current.settings.driver).to.equal('sqlite3');
      Code.expect(current.settings.filename).to.equal(':memory:');
      done();
    });
  });

  lab.experiment('loading from a file with default env option in ENV variable',
    { parallel: true }, function() {

    process.env.NODE_ENV = 'local';
    var configPath = path.join(
      __dirname,
      'database_with_default_env_from_env.json'
    );
    var _config = config.load(configPath);

    lab.test('should load a value from the env set in NODE_ENV',
      { parallel: true }, function (done) {

      var current = _config.getCurrent();
      Code.expect(current.settings.driver).to.equal('sqlite3');
      Code.expect(current.settings.filename).to.equal(':memory:');
      done();
    });
  });

  lab.experiment('loading from a file with ENV vars', { parallel: true },
    function() {

    process.env.DB_MIGRATE_TEST_VAR = 'username_from_env';
    var configPath = path.join(__dirname, 'database_with_env.json');
    var _config = config.load(configPath, 'prod');

    lab.test('should load a value from the environments', { parallel: true },
      function (done) {

      Code.expect(_config.prod.username).to.equal('username_from_env');
      done();
    });
  });

  lab.experiment('loading from a file with ENV URL', { parallel: true },
    function() {

    process.env.DB_MIGRATE_TEST_VAR = 'postgres://uname:pw@server.com/dbname';
    var configPath = path.join(__dirname, 'database_with_env_url.json');
    var _config = config.load(configPath, 'prod');

    lab.test('should load a value from the environments', { parallel: true },
      function (done) {

      var current = _config.getCurrent();
      Code.expect(current.settings.driver).to.equal('postgres');
      Code.expect(current.settings.user).to.equal('uname');
      Code.expect(current.settings.password).to.equal('pw');
      Code.expect(current.settings.host, ').to.equal(rver.com');
      Code.expect(current.settings.database).to.equal('dbname');
      done();
    });
  });

  lab.experiment('loading from an URL', { parallel: true },
    function() {

    var databaseUrl = 'postgres://uname:pw@server.com/dbname';
    var _config = config.loadUrl(databaseUrl, 'dev');

    lab.test('should export the settings as the current environment',
      { parallel: true }, function (done) {

      Code.expect(_config.dev).to.exists();
      done();
    });

    lab.test('should export a getCurrent function with all current ' +
      'environment settings', { parallel: true }, function (done) {

      var current;
      Code.expect(_config.getCurrent).to.exists();
      current = _config.getCurrent();
      Code.expect(current.env).to.equal('dev');
      Code.expect(current.settings.driver).to.equal('postgres');
      Code.expect(current.settings.user).to.equal('uname');
      Code.expect(current.settings.password).to.equal('pw');
      Code.expect(current.settings.host).to.equal('server.com');
      Code.expect(current.settings.database).to.equal('dbname');
      done();
    });
  });

  lab.experiment('loading a config with null values', function() {

    var configPath = path.join(__dirname, 'database_with_null_values.json');
    config.load = _configLoad;
    config.loadUrl = _configLoadUrl;

    lab.test('should something', function(done, cleanup) {

        cleanup(function(next) {

          delete require.cache[require.resolve('../lib/config')];
          next();
        });

        Code.expect(
          config.load.bind(this, configPath, 'dev')
        ).to.not.throw;
        done();
    });
  });
});
