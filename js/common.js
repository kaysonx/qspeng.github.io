const errorHandler = (err) => {
    if(err.includes("Invalid operation")) {
        sessionStorage.clear();
        window.location.href = "index.html";
    }

    if ($('#homeDanger').length > 0) {
        const tip = `
                     <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            <strong>Hi there!</strong> Some issues happened, please wait ang try again.
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                     </div>`;
        $('#homeDanger').html(tip);
        $('#homeDanger').closest('.container-fluid').show();
    }
    if ($('#errorInfo').length > 0) {
        $('#errorInfo').text(err);
    }

};

const queryTxStatus = (successHandler, hardCodeMsg = 'Please ensure your data is valid.') => {
    nebPay.queryPayInfo(serialNumber, {callback: NebPay.config.testnetUrl})   //search transaction result from server (result upload to server by app)
        .then(function (resp) {
            console.log("tx result: " + resp);   //resp is a JSON string
            let respObject = JSON.parse(resp);
            if (respObject.code === 0 && respObject.data.status == 1) {
                console.log('successful');
                clearInterval(intervalQuery);
                successHandler();
            } else if(respObject.code === 0 && respObject.data.status == 0){
                clearInterval(intervalQuery);
                errorHandler(hardCodeMsg);
            } else {
                errorHandler('Please wait for the transition result.');
            }
        })
        .catch(function (err) {
            console.log(err);
            if(err.message.includes("Invalid operation")) {
                sessionStorage.clear();
                window.location.href = "index.html";
            }
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