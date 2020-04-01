
function requestAPI(){
	
	//const global = "http://172.20.104.141:8090";
	//const global = "http://172.21.1.52:8090"; //吕凯政
	//const global = "http://172.21.1.47:8080"; //邵保园
	//const global = "http://172.21.1.57:8080"; //陈献中
	const global = "";
	
	return global;
}

window.onload = () => {
	//正常不用加延迟，单独看页面没问题
	//但是嵌进项目框架内后，经常会出现在页面还没加载完就执行window.onload或引入的js不按顺序加载
	//不知道是iframe的问题还是轻骑兵框架的问题
	
	//根据topForm(页面顶部的查询条件div)，设置tableBox(页面展示数据div)的高度
	setTimeout( () => {
		reset_dataDIV_of_topForm();
	}, 500);
	setTimeout( () => {
		$(".topForm").resize(function(){ //监控查询条件div的宽高
			reset_dataDIV_of_topForm();
		});
	}, 500);
	setTimeout( () => {
		setTableHeadFn(); //bootstrap-table的固定表头有问题，自己封装一个
	}, 600);
}

//根据topForm(页面顶部的查询条件div)，设置tableBox(页面展示数据div)的高度
function reset_dataDIV_of_topForm(){
	if(document.getElementsByClassName('topForm')[0] == undefined){
		return false;
	}
	let topFormHeight = document.getElementsByClassName('topForm')[0].clientHeight; //查询条件高
	console.log('页面顶部的查询条件height：' + topFormHeight + 'px');
	$('.tableBox').css({
		"height": "calc(100% - " + (topFormHeight + 4) + "px)",
	});
	$('.echartBox').css({
		"height": "calc(100% - " + (topFormHeight + 4) + "px)",
	});
}

//bootstrap-table的固定表头有问题，自己封装一个
function setTableHeadFn(){
	//表格节点的id
	let tableEleId = $("#tableId")[0] ? '#tableId' : '#customerlist';
	//加个bootstrap表格公共的成功回调
	$(tableEleId).on('load-success.bs.table',function(e,data){
		//获取表格thead内容，拼一个新表格(固定表头)，插入到表格节点之前(.tableBox的第一个节点)
		let tableHeadHTML = $(tableEleId + " thead").html(); //表格thead内容
		//新表格(固定表头)
		let tableHeadEle = '';
		tableHeadEle += '<table class="table table-bordered table-hover table-pub tableHead_fixed">';
		tableHeadEle += '	<thead>';
		tableHeadEle += 		tableHeadHTML;
		tableHeadEle += '	</thead>';
		tableHeadEle += '</table>';
		$('.tableBox').find('.tableHead_fixed').remove();
		$('.tableBox').prepend(tableHeadEle);
		//根据'表格的宽'和'每列的宽'，设置固定'表头的宽'和'每列的宽'
		reset_tableHead_of_dataTable(tableEleId);
	});
	
	//监控表格宽度变化
	$("#tableId").resize(function(){
		//根据'表格的宽'和'每列的宽'，设置固定'表头的宽'和'每列的宽'
		reset_tableHead_of_dataTable(tableEleId);
	});
	$("#customerlist").resize(function(){
		//根据'表格的宽'和'每列的宽'，设置固定'表头的宽'和'每列的宽'
		reset_tableHead_of_dataTable(tableEleId);
	});
}

//根据'表格的宽'和'每列的宽'，设置固定'表头的宽'和'每列的宽'
function reset_tableHead_of_dataTable(tableEleId){ //参数是表格的id字符串 => '#id'
	let tableWidth = $(tableEleId)[0].offsetWidth; //表格宽
	//设置固定的表头宽 = 表格宽
	$('.tableHead_fixed').attr('style','width:' + tableWidth + 'px;');
	//宽度会因为数字或字母不强制换行导致不同 => 
	//width:10%的列，他的内容是一串数字或字母，如果不设置break-all，超出宽度时会撑开而不会换行，导致宽度不对等
	//设置固定表头的每个th宽 = 表格的对应列的每个th宽
	$('.tableHead_fixed tr th').each(function(ii,ee){
		let every_th = $(tableEleId + ' tr th:eq(' + ii + ')')[0].offsetWidth;
		$(ee).attr('style','width:' + every_th + 'px;');
	});
}
