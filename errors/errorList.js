/**
 * Created by cc on 17/6/29.
 */

const ErrorType = {
    Success: 1,
    Error: 0,
    DBError: -2,
    TokenInvalid: -1000,
    TokenRejected: -1001,
    PasswordErr: -1002,
};

exports.ErrorType = ErrorType;

exports.RegisterVerifyCodeSuccess = (success) => {
    return {
        status: ErrorType.Success,
        result: {success},
        msg:'Get code success ,10 min valid'
    }
};

exports.RegisterVerifyCodeFailed = (error) => {
    return {
        status: ErrorType.Error,
        result: {error},
        msg:'Failed'
    }
};




