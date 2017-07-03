/**
 * Created by cc on 17/6/26.
 */

module.exports = function (app) {
    var searchMdseInfoList = require('../controllers/searchMdseInfoList');

    console.log('request comming - - ');

    /**
     * 添加商品分类,分类确认后关闭
     */
    app.route('/mgmt/v1/product/createMdseCategory')
        .post(searchMdseInfoList.postMdseCategorys);

    /**
     * 商品列表
     */
    app.route('/client/v1/product/searchMdseInfoList')
        .post(searchMdseInfoList.searchMdseList);

    /**
     * 增加商品
     */
    app.route('/mgmt/v1/product/createMdseItem')
        .post(searchMdseInfoList.createMdseItem);
};


