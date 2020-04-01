/**
 * Created by zww on 2017/7/25.
 */

$(function(){

    var text =$(".switching-span" , parent.document).text();
    if(text == 2){
        $("body").addClass("switch-child");
    }else {
        $("body").removeClass("switch-child");
    }
    /**
     * 创建一个下拉框列表
     * @param {Object} configObj 窗口参数
     */
    $.fn.createSingleDropDown = function(array){
        $(this).empty();
        //$(this).addClass("chosen-select");
        var sel = $(this);
        /*sel.append($("<option value=''></option>"));*/
        $.each(array, function(i, item){
            var taskName = item[1];
            if(item[1].length > 15){
                taskName = item[1].substring(0,14)+"...";
            }
            sel.append($("<option title='"+ item[1]+"' value='" + item[0] + "'>" + taskName + "</option>"));
        });
    }
    /**
     * 创建一个layer窗口
     * @param {Object} configObj 窗口参数
     * return layer实例
     */
    $.fn.createLayerWindow = function(configObj){
        var layerConfig = configObj;
        var contentHeight;
        if(configObj.full){
            layerConfig.full = function(layero, index){
                contentHeight = $(".layui-layer-content").height();
                $(".layui-layer-content").css("height" ,'100%');
                configObj.full();
            }
        }else{
            layerConfig.full = function(layero, index){
                contentHeight = $(".layui-layer-content").height();
                $(".layui-layer-content").css("height" ,'100%');
            }
        }
        if(configObj.restore){
            layerConfig.restore = function(layero, index){
                $(".layui-layer-content").css("height" ,contentHeight);
                configObj.restore();
            }
        }else{
            layerConfig.restore = function(layero, index){
                $(".layui-layer-content").css("height" ,contentHeight);
            }
        }
        layerConfig.content = $(this);
        return layer.open(layerConfig);
    }

    /**
     * 短暂提示框
     * msg: 消息
     * timeout: 提示时间
     * 回调：funciton
     */
    $.showMomentInforDlg = function(msg, timeout, callback){
        if(callback){
            layer.msg(msg,{
                time: timeout,
                icon: 1,
                area: ['300px', '180px']
            }, callback);
        }else{
            layer.msg(msg,{
                time: timeout,
                icon: 1,
                area: ['300px', '180px'],
            });
        }
    }

    /**
     * 提示框
     * title : 标题
     * msg : 信息
     * state :状态  0：警告提示框，1：成功提示框，2：错误提示框，3：确认提示框，4：拒绝操作提示，5：出错提示（不要用），6：成功提示（不要用）
     * 回调：funciton
     */
    $.showInforDlg = function(title, msg, state, callback){
        if(callback){
            layer.alert(msg, {
                icon :  state,
                shadeClose: true,
                skin: 'layui-layer-molv',
                shift: 5,
                area: ['300px', '180px'],
                title: title,
                end: callback
            });
        }else{
            layer.alert(msg, {
                icon :  state,
                shadeClose: true,
                skin: 'layui-layer-molv',
                shift: 5,
                area: ['300px', '180px'],
                title: title
            });
        }
    }


    /**
     * 重置表单
     * @param {Object} config 注意：成功返回请使用 $(this).resetForm(); // 提交后重置表单
     */
    $.fn.formReset = function(){
        $(this)[0].reset();
        //去除验证信息
        if($(this).data('validator')){
            $(this).data('validator').resetForm();
            $(this).children(".form-control .error").removeClass("error");
        }
        //chosen插件特殊处理
        $('.chosen-select').trigger("chosen:updated"); /* 试验可用 */
    }


    /**
     * 日期格式转换方法  支持 hh:mm
     * @param date
     * @param fmt
     * @returns {*}
     */
    $.dateFormattern = function (date,fmt) { //author: meizz
        var o = {
            "M+": date.month + 1, //月份
            "d+": date.date, //日
            "h+": date.hours, //小时
            "m+": date.minutes, //分
            "s+": date.seconds //秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, ((1900 + date.year) + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    // 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
    Date.prototype.Format = function(fmt)
    { //author: meizz
        var o = {
            "M+" : this.getMonth()+1,                 //月份
            "d+" : this.getDate(),                    //日
            "h+" : this.getHours(),                   //小时
            "m+" : this.getMinutes(),                 //分
            "s+" : this.getSeconds(),                 //秒
            "q+" : Math.floor((this.getMonth()+3)/3), //季度
            "S"  : this.getMilliseconds()             //毫秒
        };
        if(/(y+)/.test(fmt))
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        for(var k in o)
            if(new RegExp("("+ k +")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        return fmt;
    }

    /**
     * 数字加千位符，并保留小数点后两位
     * @param num
     * @param precision
     * @param separator
     * @returns {*}
     */
    $.numFormatter = function formatNumber(num, precision, separator) {
        var parts;
        // 判断是否为数字
        if (!isNaN(parseFloat(num)) && isFinite(num)) {
            // 把类似 .5, 5. 之类的数据转化成0.5, 5, 为数据精度处理做准, 至于为什么
            // 不在判断中直接写 if (!isNaN(num = parseFloat(num)) && isFinite(num))
            // 是因为parseFloat有一个奇怪的精度问题, 比如 parseFloat(12312312.1234567119)
            // 的值变成了 12312312.123456713
            num = Number(num);
            // 处理小数点位数
            num = (typeof precision !== 'undefined' ? num.toFixed(precision) : num).toString();
            // 分离数字的小数部分和整数部分
            parts = num.split('.');
            // 整数部分加[separator]分隔,
            parts[0] = parts[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + (separator || ','));

            return parts.join('.');
        }
        return num;
    }

    $.fileSize = function (params){
        var fileSize= params;
        if(!isNaN(params)){
            if (params < 1024) {
                fileSize = parseInt(params).toFixed(2) + "B";
            } else if (params < 1048576) {
                fileSize = (parseInt(params)/ 1024).toFixed(2) + "KB";
            } else if (params < 1073741824) {
                fileSize = (parseInt(params)/ 1048576).toFixed(2) + "MB";
            } else {
                fileSize = (parseInt(params) / 1073741824).toFixed(2) + "G";
            }
        }
        return fileSize;
    }

    /*------------------------------------新增-------------------------------*/
    /**
     * bootstrap行合并表格
     * @param num
     * @param precision
     * @param separator
     * @returns {*}
     */
    /*调用格式：
     var data = $("#runInfo").bootstrapTable('getData', true);
     var num = $("#runInfo").bootstrapTable('getData').length;
    $.fn.mergeCell($("#runInfo"), data, num, "PROJECTNAME0");*/
    $.fn.mergeCell = function (paramsTab, data, num, tagName) {
        var rowss = 0;
        //合并单位列
        for (var i = 0; i < num - 1; i++) {
            if (data[i][tagName] != data[i + 1][tagName]) {
                paramsTab.bootstrapTable('mergeCells', {index: rowss, field: tagName, rowspan: i + 1 - rowss});
                rowss = i + 1;
            }
            if (i == num - 2) {
                paramsTab.bootstrapTable('mergeCells', {index: rowss, field: tagName, rowspan: i + 2 - rowss});
            }
        }
    }
    /**
     * bootstrap列合并表格
     * @param num
     * @param precision
     * @param separator
     * @returns {*}
     */
    /*调用格式： $.fn.mergeColspan(data, ["FDepName3", "FDepName1", "FDepName2"], $('#table2'));//列合并*/
    $.fn.mergeColspan = function (data, fieldNameArr, target) {
        if (data.length == 0) {
            alert("不能传入空数据");
            return;
        }
        if (fieldNameArr.length == 0) {
            alert("请传入属性值");
            return;
        }
        var num = -1;
        var index = 0;
        for (var i = 0; i < data.length; i++) {
            num++;
            for (var v in fieldNameArr) {
                index = 1;
                if (data[i][fieldNameArr[v]] != data[i][fieldNameArr[0]]) {
                    index = 0;
                    break;
                }
            }
            if (index == 0) {
                continue;
            }
            $(target).bootstrapTable('mergeCells', { index: num, field: fieldNameArr[0], colspan: fieldNameArr.length, rowspan: 1 });
        }
    }
    /**
     * 普通下拉框查询
     * @param num
     * @param precision
     * @param separator
     * @returns {"CHILDREN":[{"CODE":"xx","NAME":"yy"},{"CODE":"xx","NAME":"yy"},...]}
     */
    $.fn.generalSelect = function (url,selectTag,variable) {
        $.ajax({
            url:url,
            type:'post',
            async:false,
            dataType:'json',
            success:function (records) {
                var stateItems = new Array();
                $.each(records.CHILDREN,function (index,data) {
                    var stateItem = [];
                    stateItem.push(data.CODE);
                    stateItem.push(data.NAME);
                    stateItems.push(stateItem);
                });
                if(variable.length > 0){
                    stateItems.unshift(variable);
                }
                $("#"+ selectTag).createSingleDropDown(stateItems);
            }
        })
    };
    /**
     * 需要级联的下拉框查询
     * @param num
     * @param precision
     * @param separator
     * @returns {"CHILDREN":[{"CODE":"xx","NAME":"yy"},{"CODE":"xx","NAME":"yy"},...]}
     */
    $.fn.cascaSelect = function (url,models,selectTag,variable) {
        $.ajax({
            url:url,
            type:'post',
            data:{
                models:models
            },
            async:false,
            dataType:'json',
            success:function (records) {
                var stateItems = new Array();
                $.each(records.CHILDREN,function (index,data) {
                    var stateItem = [];
                    stateItem.push(data.CODE);
                    stateItem.push(data.NAME);
                    stateItems.push(stateItem);
                });
                if(variable.length > 0){
                    stateItems.unshift(variable);
                }
                $("#" + selectTag).createSingleDropDown(stateItems);
            }
        })

    }

    /**
     * 需要级联的下拉框查询(三个参数)
     * @param num
     * @param precision
     * @param separator
     * @returns {"CHILDREN":[{"CODE":"xx","NAME":"yy"},{"CODE":"xx","NAME":"yy"},...]}
     */
    $.fn.threeSelect = function (url,models1,models2,selectTag,variable) {
        $.ajax({
            url:url,
            type:'post',
            data:{
                models1:models1,
                models2:models2
            },
            async:false,
            dataType:'json',
            success:function (records) {
                var stateItems = new Array();
                $.each(records.CHILDREN,function (index,data) {
                    var stateItem = [];
                    stateItem.push(data.CODE);
                    stateItem.push(data.NAME);
                    stateItems.push(stateItem);
                });
                if(variable.length > 0){
                    stateItems.unshift(variable);
                }
                $("#" + selectTag).createSingleDropDown(stateItems);
            }
        })

    }
    // 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
    Date.prototype.Format = function(fmt)
    { //author: meizz
        var o = {
            "M+" : this.getMonth()+1,                 //月份
            "d+" : this.getDate(),                    //日
            "h+" : this.getHours(),                   //小时
            "m+" : this.getMinutes(),                 //分
            "s+" : this.getSeconds(),                 //秒
            "q+" : Math.floor((this.getMonth()+3)/3), //季度
            "S"  : this.getMilliseconds()             //毫秒
        };
        if(/(y+)/.test(fmt))
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        for(var k in o)
            if(new RegExp("("+ k +")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        return fmt;
    }

    //获取唯一id的方法
    $.getGuid = function(){
        var guid = "";
        for (var i = 1; i <= 32; i++){
            var n = Math.floor(Math.random()*16.0).toString(16);
            guid +=   n;
            if((i==8)||(i==12)||(i==16)||(i==20))
                guid += "-";
        }
        return guid;
    }
    /**
     * 创建一个下拉框列表  针对可查询下拉框某几项不让选择的方法
     * @param {Object} configObj 窗口参数,后台除了CODE、NAME之外还需传入参数ISSELECT，当ISSELECT == 'All'时为不可选
     */
    $.fn.createSingleDropDownForUnchoose = function(array){
        $(this).empty();
        var sel = $(this);
        $.each(array, function(i, item){
            var taskName = item[1];
            if(item[1].length > 15){
                taskName = item[1].substring(0,14)+"...";
            }
                if(item[2] == "ALL" ){
                    sel.append($("<option title='"+ item[1]+"' value='" + item[0] + "'>" + taskName + "</option>"));
                }else{
                    sel.append($("<option title='"+ item[1]+"' value='" + item[0] + "'  disabled='disabled'>" + taskName + "</option>"));
                }
        });
    };

    /**
     * 创建一个下拉框列表  针对可查询下拉框某几项不让选择的方法(编辑，存在某几项可选)
     * @param {Object} configObj 窗口参数,后台除了CODE、NAME之外还需传入参数ISSELECT，当ISSELECT == 'All'时为不可选,ISCHIOSE为ALL时，为原信息已选车组
     */
    $.fn.createSingleDropDownForEditchoose = function(array){
        $(this).empty();
        var sel = $(this);
        $.each(array, function(i, item){
            var taskName = item[1];
            if(item[1].length > 15){
                taskName = item[1].substring(0,14)+"...";
            }
            //当ISSELECT为ALL时，说明该选项没有被选，可以为该车组选择
            //当ISSELECT不为ALL，且ISCHIOSE不为ALL时，说明该车组被选，且是被自己所选，应该为selected状态
            //当ISSELECT不为ALL，且ISCHIOSE为ALL时，说明该车组被其他作业包选择，设置为disabled状态
            if(item[2] == "ALL"){
                sel.append($("<option title='"+ item[1]+"' value='" + item[0] + "'>" + taskName + "</option>"));
            }else if(item[2] != "ALL" && item[3] != "ALL"){
                sel.append($("<option title='"+ item[1]+"' value='" + item[0] + "' selected='selected' >" + taskName + "</option>"));
            }else{
                sel.append($("<option title='"+ item[1]+"' value='" + item[0] + "' disabled='disabled' >" + taskName + "</option>"));
            }
        });
    };



});