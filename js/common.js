const errorHandler = (err) => {
    if ($('#homeDanger').length > 0) {
        $('#homeDanger').show();
    }
    if ($('#errorInfo').length > 0) {
        $('#errorInfo').text(err);
    }

};

const queryTxStatus = (successHandler) => {
    nebPay.queryPayInfo(serialNumber, {callback: NebPay.config.testnetUrl})   //search transaction result from server (result upload to server by app)
        .then(function (resp) {
            console.log("tx result: " + resp);   //resp is a JSON string
            let respObject = JSON.parse(resp);
            if (respObject.code === 0) {
                console.log('successful');
                clearInterval(intervalQuery);
                successHandler();
            }
        })
        .catch(function (err) {
            console.log(err);
            errorHandler('Ooops, some error occurred. Please try again.');
        });
};

const encodeData = (data) => {
    try {
        const secret = sessionStorage.getItem("secret");
        if (!secret) {
            throw new Error('Ooops, some error occurred. Please try again.');
        }
        return data.map(item => {
            let base64Item = convertToBase64(item + secret);
            return _crypt(base64Item, secret);
        });
    } catch (err) {
        errorHandler(err.message);
    }
};

const sendRequestWithDynamicSecret = (requestFunc) => {
    const from = Account.NewAccount().getAddressString();

    let value = 0;
    let nonce = 0;
    let callFunction = "getDynamicSecret";
    let callArgs = [];
    const contract = {
        "function": callFunction,
        "args": callArgs.toString()
    };

    neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(response => {
        let result;
        try {
            result = JSON.parse(response.result);
            if (result) {
                sessionStorage.setItem("secret", result);
                if (requestFunc && typeof requestFunc == "function") {
                    requestFunc();
                }
            }
        } catch (err) {
            errorHandler(response.result);
        }
    }).catch(err => {
        console.log("error:" + err.message);
        errorHandler('Ooops, some error occurred. Please try again.');
    });
};