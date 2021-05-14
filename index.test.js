const { describe, it } = require('mocha');
const expect = require('chai').expect;
const sinon = require('sinon');

const {
  fetchCurrentCity,
  fetchWeather,
  fetchForecast,
  Operation
} = require('./index.js');

describe('fetchCurrentCity', function() {
  it('should allow to register callback later', function(done) {
    // Arrange
    const onSuccess = () => done();
    const onError = err => done(err);
    
    // Act
    const op = fetchCurrentCity();
    op.onCompletition(onSuccess, onError);

  });

  it('should allow to register multiple callbacks later', function(done) {
    // Arrange
    let callCounter = 0;
    const onSuccess = () => callCounter++;
    const onError = err => done(new Error('onError should not be called'));
    
    // Act
    const op = fetchCurrentCity();
    op.onCompletition(onSuccess, onError);
    op.onCompletition(
      () => {
        onSuccess();
        if (callCounter == 2) {
          return done();
        }
        done(new Error('onSucess should be called two times.'));
      },
      onError
    );
  });

  it('should allow to add separate callback for success', function(done) {
    // Arrange

    // Act
    const op = fetchCurrentCity();

    // Assert
    op.onCompletition(() => done());
  });

  it('should allow to add separate callback for failure', function(done) {
    // Arrange

    // Act
    const op = fetchCurrentCity(false);

    // Assert
    op.onFailure(() => done());
  });
});

describe('fetchWeather', function() {
  it('should use operation for success', function(done) {
    // Arrange

    // Act
    const op = fetchWeather('city');

    // Assert
    op.onCompletition(() => done());
  });

  it('should use operation for failure', function(done) {
    // Arrange

    // Act
    const op = fetchWeather();

    // Assert
    op.onFailure(() => done());
  });
});

describe('Operation', function() {
  it('should allow to register callback asynchronously', function(done) {
    // Arrange
    const op = new Operation();

    // Act 
    setImmediate(() => op.completed(null, 'success'));

    // Assert
    setImmediate(() => op.onCompletition(() => done()));
  });

  it('should allow to run two operations in parallel', function(done) {
    // Arrange
    const city = 'Rozbórz City';
    const weather = fetchWeather(city);
    const forecast = fetchForecast(city);

    // Act 
    weather.onCompletition(weather => {
      forecast.onCompletition(forecast => {
        done();
      });
    });

    // Assert
  });

  it('should allow to use result form deepest operation later in code', function(done) {
    // Arrange
    const op = new Operation();

    // Act 
    fetchCurrentCity().onCompletition(city => {
      fetchWeather(city).onCompletition(weather => {
        op.succeed(weather);
      });
    });

    op.onCompletition(result => {
      done();
    });
  });

  it('should allow to forward completition to next operation', function(done) {
    // Arrange
    const op = new Operation();

    // Act 
    fetchCurrentCity().onCompletition(city => {
      fetchWeather(city).forwardCompletition(op);
    });

    op.onCompletition(result => {
      done();
    });
  });

  it('should implicitly forward completition to next operation', function(done) {
    // Arrange

    // Act 
    fetchCurrentCity()
      .then(fetchWeather)
      .then(result => {
        done();
      });
  });
});
