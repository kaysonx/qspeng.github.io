$(($) => {
    $('#signInBtn').click(() => {
        sendRequestWithDynamicSecret(loginHandler);
        return false;
    });

    $('#singUpBtn').click(() => {
        sendRequestWithDynamicSecret(registerHandler);
        return false;
    });

    $('#retrieveBtn').click(() => {
        sendRequestWithDynamicSecret(retrieveHandler);
        return false;
    });
});

const registerSuccessHandler = () => {
    window.location.href = "index.html";
};

const loginHandler = () => {
    $('#errorInfo').text('');
    if (!validateForm()) {
        return false;
    }
    let userAccount = $('#account').val();
    let userPassword = $('#password').val();

    userAccount = userAccount && userAccount.trim() || '';
    userPassword = userPassword || '';

    const loginUser = {
        userAccount,
        userPassword
    };

    const from = Account.NewAccount().getAddressString();

    let value = 0;
    let nonce = 0;
    let callFunction = "signIn";
    let callArgs = [];
    callArgs.push(JSON.stringify(loginUser));
    const encodeCallArgs = JSON.stringify(encodeData(callArgs));
    const contract = {
        "function": callFunction,
        "args": encodeCallArgs
    };

    neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(response => {
        let result;
        try {
            result = JSON.parse(response.result);
            if (result && result.isSuccess) {
                sessionStorage.setItem("payload", JSON.stringify(result.payload));
                window.location.href = "home.html";
            }
        } catch (err) {
            errorHandler(response.result);
        }
    }).catch(err => {
        console.log("error:" + err.message);
        errorHandler('Ooops, some error occurred. Please try again.');
    });
};

const registerHandler = () => {
    $('#errorInfo').text('');
    if (!validateForm()) {
        return false;
    }
    let userAccount = $('#registerAccount').val();
    let userPassword = $('#registerPass').val();
    let retrieveKey = $('#retrieveKey').val();

    userAccount = userAccount && userAccount.trim() || '';
    userPassword = userPassword || '';
    retrieveKey = retrieveKey || '';

    const registerUser = {
        userAccount,
        userPassword,
        retrieveKey
    };

    let value = 0;
    let callFunction = "signUp";
    let callArgs = []; //in the form of ["args"]
    callArgs.push(JSON.stringify(registerUser));
    const encodeCallArgs = JSON.stringify(encodeData(callArgs));
    serialNumber = nebPay.call(dappAddress, value, callFunction, encodeCallArgs, {
        listener: () => {
        },
        callback: NebPay.config.mainnetUrl
    });

    intervalQuery = setInterval(function () {
        queryTxStatus(registerSuccessHandler, "Account exists.");
    }, 6000);
};

const retrieveHandler = () => {
    $('#errorInfo').text('');
    if (!validateForm()) {
        return false;
    }
    let userAccount = $('#retrieveAccount').val();
    let userPassword = $('#retrievePass').val();
    let retrieveKey = $('#retrieveKey').val();

    userAccount = userAccount && userAccount.trim() || '';
    userPassword = userPassword || '';
    retrieveKey = retrieveKey || '';

    const retrieveUser = {
        userAccount,
        userPassword,
        retrieveKey
    };

    let value = 0;
    let callFunction = "retrievePassword";
    let callArgs = []; //in the form of ["args"]
    callArgs.push(JSON.stringify(retrieveUser));
    const encodeCallArgs = JSON.stringify(encodeData(callArgs));
    serialNumber = nebPay.call(dappAddress, value, callFunction, encodeCallArgs, {
        listener: () => {
        },
        callback: NebPay.config.mainnetUrl
    });

    intervalQuery = setInterval(function () {
        queryTxStatus(registerSuccessHandler, "Please ensure your user account & retrieveKey is matched.");
    }, 6000);
};

