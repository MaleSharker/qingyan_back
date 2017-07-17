/**
 * Created by cc on 17/6/26.
 */

module.exports = function (app) {
    var categoryManager = require('../controllers/categoryManage');
    let spuController = require('../controllers/spuController');

    /**
     * 添加商品分类,分类确认后关闭
     */
    app.route('/mgmt/v1/product/createMdseCategory')
        .post(categoryManager.postAddCategory);

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

    /**
     * 获取某一分类下的商品
     */
    app.route('/mgmt/v1/product/categoryAllSPU')
        .post(spuController.postCategoryAllSPU);

    /**
     * 上传SPU详情图
     */
    app.route('/mgmt/v1/product/uploadSPUDetail')
        .post(spuController.postUploadSPUDetailImages);

    /**
     * 创建 SKU
     */
    app.route('/mgmt/v1/product/createSKU')
        .post(spuController.postCreateSKU);


};


