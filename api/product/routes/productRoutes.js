/**
 * Created by cc on 17/6/26.
 */

module.exports = function (app) {
    // var searchMdseInfoList = require('../controllers/searchMdseInfoList');
    var categoryManager = require('../controllers/categoryManage');
    let spuController = require('../controllers/spuController');


    /**
     * 添加商品分类,分类确认后关闭
     */
    app.route('/mgmt/v1/product/createMdseCategory')
        .post(categoryManager.postAddCategory);
        // .post(searchMdseInfoList.postMdseCategorys);

    /**
     * 商品列表
     */
    // app.route('/client/v1/product/searchMdseInfoList')
    //     .post(searchMdseInfoList.searchMdseList);

    /**
     * 增加商品
     */
    app.route('/mgmt/v1/product/createSPU')
        .post(spuController.postCreateSPU);

    /**
     * 品牌下商品列表
     */
    app.route('/mgmt/v1/product/tenantAllSPU')
        .post(spuController.postTenantAllSPU);

};


