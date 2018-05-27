$($ => {
    constructBoxList();
    constructBoxModal($);
    bindEventForBox();
});

const queryBoxes = (user) => {
    const from = Account.NewAccount().getAddressString();

    let value = 0;
    let nonce = 0;
    let callFunction = "getBoxes";
    let callArgs = [];
    callArgs.push(user);
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
                if (!!result.payload) {
                    sessionStorage.setItem("payload", JSON.stringify(result.payload));
                    if (result.payload.secret) {
                        sessionStorage.setItem("secret", result.payload.secret);
                    }
                    constructBoxListHtml(result.payload.boxes);
                }
            }
        } catch (err) {
            errorHandler(response.result);
        }
    }).catch(err => {
        console.log("error:" + err.message);
        errorHandler('Ooops, some error occurred. Please try again.');
    })
};

const constructBoxList = () => {
    let payload = sessionStorage.getItem("payload");
    if (!payload) {
        window.location.href = "index.html";
    }
    const {user, boxes} = JSON.parse(payload);

    if (!user) {
        window.location.href = "index.html";
    }
    if (!boxes) {
        queryBoxes(user);
    } else {
        constructBoxListHtml(boxes);
    }
};

const constructBoxListHtml = (list) => {
    const htmlList = list.map((item, index) => {
        return `
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">#${index}</h5>
                        <p class="card-text">
                            <div class="alert alert-primary" role="alert">
                                <strong><span class="keyColor">Key-></span> ${item.key}</strong>
                            </div>
                        </p>
                        <a href="#" class="btn btn-primary" data-toggle="modal" data-target="#boxModal"
                           data-key="${item.key}" data-value="${item.value}" data-operation="view">Open</a>
                        <a href="#" class="btn btn-secondary" data-toggle="modal" data-target="#boxModal"
                           data-key="${item.key}" data-value="${item.value}" data-operation="edit"">Edit</a>
                        <a href="#" class="btn btn-danger" data-toggle="modal" data-target="#deleteModal"
                           data-key="${item.key}">Delete</a>
                    </div>
                </div>
            </div>
        `;
    });

    let finalHtml = ``;
    for (let i = 0; i < htmlList.length; i++) {
        if ((i + 1) % 3 == 1) {
            finalHtml += `
                    <div class="container-fluid">
                        <div class="row">
                    `;
            finalHtml += htmlList[i];
        } else if ((i + 1) % 3 == 0) {
            finalHtml += htmlList[i];
            finalHtml += `
                        </div>
                    </div>
                    `;
        } else {
            finalHtml += htmlList[i];
        }
    }
    if (finalHtml) {
        $('#boxList').html('').html(finalHtml);
    }
};

const constructBoxModal = () => {
    $('#boxModal').on('show.bs.modal', function (event) {
        $('#boxModalInfo').hide();
        hideAllValidate();
        let button = $(event.relatedTarget);
        let key = button.data('key');
        let value = button.data('value');
        let operation = button.data('operation');
        let modal = $(this);
        modal.find('#key').val(key);
        modal.find('#value').val(value);
        switch (operation) {
            case 'view':
                modal.find('.modal-title').text('View: ' + key);
                modal.find('#key').attr("readonly", 'readonly');
                modal.find('#value').attr("readonly", 'readonly');
                modal.find('#operationBtn').hide();
                break;
            case 'edit':
                modal.find('.modal-title').text('Edit: ' + key);
                modal.find('#key').attr("readonly", 'readonly');
                modal.find('#value').removeAttr("readonly");
                modal.find('#operationBtn').text('Edit').show();
                break;
            case 'new':
                modal.find('.modal-title').text('Add a new box');
                modal.find('#key').removeAttr("readonly");
                modal.find('#value').removeAttr("readonly");
                modal.find('#operationBtn').text('Add').show();
                break;
            default:
                console.log('no such operation...');
        }
    });

    $('#deleteModal').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget);
        let key = button.data('key');
        let modal = $(this);
        const infoMsg = `<h6>Are you sure to delete box: <strong>${key}</strong> ? <br/> Once you did it, the box will never come back!</h6>`;
        modal.find('.modal-body').html(infoMsg);
        $('#deleteKey').val(key);
    });
};

const bindEventForBox = () => {
    $('#operationBtn').click(addOrUpdateBox);
    $('#deleteBtn').click(deleteBox);
    $('#loadBoxesBtn').click(loadLatestData);
    $('#logoutBtn').click(logout);
    $('#searchBtn').click(search);
    showUser();
};

const addOrUpdateBox = () => {
    if (!validateForm()) {
        return false;
    }
    let boxKey = $('#key').val();
    let boxValue = $('#value').val();
    if (!boxKey || !boxValue) {
        return;
    }
    const box = {
        key: boxKey,
        value: boxValue
    };

    let value = 0;
    let callFunction = "save";
    let callArgs = []; //in the form of ["args"]
    const payload = sessionStorage.getItem('payload');
    if (!payload) {
        window.location.href = 'index.html';
    }
    const {user} = JSON.parse(payload);
    const saveEntity = {
        userAccount: user,
        box
    };
    callArgs.push(JSON.stringify(saveEntity));
    const encodeCallArgs = JSON.stringify(encodeData(callArgs));
    serialNumber = nebPay.call(dappAddress, value, callFunction, encodeCallArgs, {
        listener: () => {
        },
        callback: NebPay.config.testnetUrl
    });

    $('#boxModalInfo').show();

    intervalQuery = setInterval(function () {
        queryTxStatus(boxOperationSuccessHandler);
    }, 10000);
};

const deleteBox = () => {
    let value = 0;
    let callFunction = "delete";
    let callArgs = []; //in the form of ["args"]
    const payload = sessionStorage.getItem('payload');
    if (!payload) {
        window.location.href = 'index.html';
    }
    const {user} = JSON.parse(payload);
    const key = $('#deleteKey').val();

    const deleteEntity = {
        userAccount: user,
        key
    };
    callArgs.push(JSON.stringify(deleteEntity));
    const encodeCallArgs = JSON.stringify(encodeData(callArgs));
    serialNumber = nebPay.call(dappAddress, value, callFunction, encodeCallArgs, {
        listener: () => {
        },
        callback: NebPay.config.testnetUrl
    });
    intervalQuery = setInterval(function () {
        queryTxStatus(boxOperationSuccessHandler);
    }, 10000);
};

const boxOperationSuccessHandler = () => {
    loadLatestData();
    $('#boxModal').modal('hide');
    $('#deleteModal').modal('hide');
    const tip = `
                <div class="alert alert-warning alert-dismissible fade show" role="alert">
                    <strong>Hi there!</strong> Your operation is done, once the transaction is confirmed & feel free to load latest boxes.
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>`;
    $('#homeInfo').html(tip);
    $('#homeInfo').closest('.container-fluid').show();
};

const loadLatestData = () => {
    sessionStorage.getItem('payload');
    const payload = sessionStorage.getItem('payload');
    if (!payload) {
        window.location.href = 'index.html';
    }
    const {user} = JSON.parse(payload);
    queryBoxes(user);
    return false;
};

const logout = () => {
    sessionStorage.removeItem('payload');
    window.location.href = 'index.html';
};

const search = () => {
    sessionStorage.getItem('payload');
    const payload = sessionStorage.getItem('payload');
    if (!payload) {
        window.location.href = 'index.html';
    }
    const {boxes} = JSON.parse(payload);
    let key = $('#searchKey').val() ? $('#searchKey').val() : '';
    key = key.trim();
    if (!!key) {
        const filteredBoxes = boxes.filter(box => box.key.includes(key));
        if (filteredBoxes.length > 0) {
            constructBoxListHtml(filteredBoxes)
        } else {
            const tip = `
                         <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                <strong>Hi there!</strong> No result for your search, please use another key.
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                         </div>`;
            $('#homeTip').html(tip);
            $('#homeTip').closest('.container-fluid').show();
        }
    } else {
        constructBoxListHtml(boxes);
    }
    return false;
};

const showUser = () => {
    sessionStorage.getItem('payload');
    const payload = sessionStorage.getItem('payload');
    if (!payload) {
        window.location.href = 'index.html';
    }
    const {user} = JSON.parse(payload);
    $('#showUser').text('Hi ' + user + ', ');
};
