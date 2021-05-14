const delayms = 1;

function getCurrentCity(callback, success = true) {
  setTimeout(function () {

    const city = "New York, NY";
    success
      ? callback(null, city)
      : callback(new Error('there is no city'), null);

  }, delayms)
}

function getWeather(city, callback) {
  setTimeout(function () {

    if (!city) {
      callback(new Error("City required to get weather"));
      return;
    }

    const weather = {
      temp: 50
    };

    callback(null, weather)

  }, delayms)
}

function getForecast(city, callback) {
  setTimeout(function () {

    if (!city) {
      callback(new Error("City required to get forecast"));
      return;
    }

    const fiveDay = {
      fiveDay: [60, 70, 80, 45, 50]
    };

    callback(null, fiveDay)

  }, delayms)
}

function Operation() {
  const operation = {
    status: 'pending',
    successCallbacks: [],
    errorCallbacks: []
  };

  operation.onCompletition = function(onSuccess, onError) {
    const completitionOp = new Operation();
    function successHandler() {
      if (onSuccess) {
        const callbackResult = onSuccess(operation.result);
        if (callbackResult && callbackResult.onCompletition) {
          callbackResult.forwardCompletition(completitionOp);
        } else {
          completitionOp.succeed(callbackResult);
        }
      }
    }

    if (operation.status === 'success') {
      successHandler();
      //return onSuccess && onSuccess(operation.result);
    } else if (operation.status === 'failure') {
      onError && onError(operation.error);
    } else {
      operation.successCallbacks.push(successHandler);
      operation.errorCallbacks.push(onError);
    }

    return completitionOp;
  };

  operation.then = operation.onCompletition;

  operation.onFailure = function(onError) {
    return operation.onCompletition(null, onError);
  }

  operation.succeed = function(result) {
    operation.completed(null, result);
  }

  operation.fail = function(err) {
    operation.completed(err, null);
  }

  operation.forwardCompletition = function(op) {
    operation.onCompletition(op.succeed, op.fail);
  }

  operation.completed = function(err, result) {
    if (err) {
      operation.status = 'failure';
      operation.error = err;
      return operation.errorCallbacks.forEach(onErrorCb => onErrorCb(err));
    }
    operation.status = 'success';
    operation.result = result;
    operation.successCallbacks.forEach(onSuccessCb => onSuccessCb(result));
  }

  return operation;
}

function fetchCurrentCity(success) {
  const operation = new Operation();

  getCurrentCity((err, result) => {
    operation.completed(err, result);
  }, success);
  return operation;
}

function fetchWeather(city) {
  const operation = new Operation();
  getWeather(city, (err, result) => {
    operation.completed(err, result);
  });
  return operation;
}

function fetchForecast(city) {
  const operation = new Operation();
  getForecast(city, (err, result) => {
    operation.completed(err, result);
  });
  return operation;
}

module.exports = {
  fetchCurrentCity,
  fetchWeather,
  fetchForecast,
  Operation,
}
