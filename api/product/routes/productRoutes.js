/**
 * Created by cc on 17/6/26.
 */

module.exports = function (app) {
    var searchMdseInfoList = require('../controllers/searchMdseInfoList');

    console.log('request comming - - ');

    app.route('/client/v1/product/searchMdseInfoList')
        .post(searchMdseInfoList.searchMdseList);

    app.route('/mgmt/v1/product/createMdseItem')
        .post(searchMdseInfoList.createMdseItem);
};


