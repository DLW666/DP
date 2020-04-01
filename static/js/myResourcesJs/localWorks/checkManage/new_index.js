
const request_api = requestAPI(); //全局api

var HTML_fontSize; //根字体大小-统计图用来计算字体大小

var swiper_reworkTable = null; //质量监控-当前月返工返修单列表轮播实例
var swiper_reworkLegend = null; //返工返修-故障图表图例列表轮播实例
var swiper_qualityLegend = null; //质量鉴定-故障图表图例列表轮播实例
var swiper_workingList0 = null; //质量监控-正在作业轮播实例
var swiper_workingList1 = null; //质量监控-待作业轮播实例
var swiper_workingList2 = null; //质量监控-已完成作业轮播实例
var swiper_photoList = null; //质量监控-照片列表轮播实例
var swiper_userStatList = null; //质量监控-用户统计运用所列表轮播实例

var photoTiming = null; //照片选中状态定时器实例
var mainListTiming = null; //关键配件跟踪定时器实例
var basisTableTiming = null; //基础作业表格定时器实例

var photoListData = null; //照片列表数据
var basisTableData = null; //基础作业表格数据
var thisPlanId = null; //当前时间日计划
var photoRelationTiming = 3000; //当前月返工返修单、正在作业、待作业、已完成作业-轮播时间

//暂无数据
let data_none = '<p class="data_none" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)">暂无数据</p>'

$(function(){
	//loading
	// $(document).ajaxStart(function(){
	// 	layer.load(0);
	// });
	// $(document).ajaxStop(function(){
	// 	layer.closeAll('loading');
	// });
	
	getLocaStorageTiming(); //获取本地缓存中的轮播时间
	setHTML_fontSize(); //设置根字体大小
	// getTime(); //获取当前日期、时间(不要服务器时间了)
	setTime(); //设置时间
	getMenuUnitList(); //获取自定义菜单运用所下拉选 - 同步请求
	// getPhotoRelationTiming(); //获取 当前月返工返修单、正在作业、待作业、已完成作业的轮播时间 - 同步请求
	// timingToChangeAllData(); //获取当前时间日计划
	
	allDataChange(); //所有数据更新
	
	setInterval( () => {
		allDataChange(); //所有数据更新
		// timingToChangeAllData(); //判断当前时间的日计划是否改变
	} ,60000);
	
})

function allDataChange(){ //所有数据更新
	getPhotoList(); //获取质量监控-照片列表
	getUserStatistics(); //获取用户统计
	getComm_topEchart(); //获取质量评价-top柱状图数据
	getComm_botEchart(); //获取质量评价-bottom折线图数据
	getBasisTable(); //获取基础作业
	getMinList(); //获取关键配件跟踪列表
	getRework_faultStatistics(); //获取返工返修故障环状图数据
	getRework_unitStatistics(); //获取返工返修运用所柱状图数据
	getQuality_faultStatistics(); //获取质量鉴定故障环状图数据
	getQuality_unitStatistics(); //获取质量鉴定运用所柱状图数据
}

function getPhotoRelationTiming(){ //获取 当前月返工返修单、正在作业、待作业、已完成作业的轮播时间 - 同步请求
	$.ajax({
		url: request_api + '',
		data: {
			
		},
		type: 'post',
		dataType: 'json',
		async: false,
		success: res => {
			photoRelationTiming = parseInt(res);
		},
		error: err => {
			if(err.readyState == 0){
				$.showInforDlg('提示','网络异常，请检查网络！',2);
			}else{
				$.showInforDlg('提示','当前月返工返修单、正在作业、待作业、已完成作业轮播时间获取失败！',7);
			}
			console.log(err);
		},
		complete: () => {
			
		}
	})
}

function timingToChangeAllData(){ //判断当前时间的日计划是否改变
	//当前本地时间
	let thisDate = new Date();
	//获取年月日时分秒
	let y = thisDate.getFullYear();
	let m = thisDate.getMonth() + 1 > 9 ? thisDate.getMonth() + 1 : '0' + (thisDate.getMonth() + 1);
	let d = thisDate.getDate() > 9 ? thisDate.getDate() : '0' + thisDate.getDate();
	let h = thisDate.getHours() > 9 ? thisDate.getHours() : '0' + thisDate.getHours();
	let mi = thisDate.getMinutes() > 9 ? thisDate.getMinutes() : '0' + thisDate.getMinutes();
	let s = thisDate.getSeconds() > 9 ? thisDate.getSeconds() : '0' + thisDate.getSeconds();
	
	let thisTime = y + '-' + m + '-' + d + ' ' + h + ':' + mi + ':' + s;
	$.ajax({
		url: request_api + '/qualityManage/getPlandId',
		data: {
			thisTime: thisTime
		},
		type: 'post',
		dataType: 'json',
		async: false,
		success: res => {
			console.log(res);
			if(thisPlanId == null){ //第一次获取日计划，只赋值
				thisPlanId = res;
				return;
			}
			if(thisPlanId != res){ //日计划有变化
				allDataChange(); //所有数据更新
			}
		},
		error: err => {
			if(err.readyState == 0){
				$.showInforDlg('提示','网络异常，请检查网络！',2);
			}else{
				$.showInforDlg('提示','获取日计划失败！',7);
			}
			console.log(err);
		},
		complete: () => {
			
		}
	})
}

function getLocaStorageTiming(){ //获取本地缓存中的轮播时间
	if(!localStorage.getItem('photoTiming')){ //缓存不存在-照片
		//设置默认缓存
		localStorage.setItem('photoTiming','3000');
	}
	if(!localStorage.getItem('bottomLineTiming')){ //缓存不存在-基础作业、关键配件跟踪、返工返修、质量鉴定
		//设置默认缓存
		localStorage.setItem('bottomLineTiming','5000');
	}
}

function setHTML_fontSize(){ //设置根字体大小
	let pageWidth = $('#pageBox')[0].offsetWidth;
	HTML_fontSize = pageWidth / 120;
	$('html').attr('style', 'font-size: ' + HTML_fontSize + 'px !important');
}

// function getTime(){ //获取当前日期、时间(不要服务器时间了)
// 	$.ajax({
// 		url: request_api + '/interfaces/getTime',
// 		data: {
// 			
// 		},
// 		type: 'post',
// 		dataType: 'json',
// 		async: false,
// 		success: res => {
// 			console.log(res);
// 			setTime(res); //时间
// 		},
// 		error: err => {
// 			if(err.readyState == 0){
// 				$.showInforDlg('提示','网络异常，请检查网络！',2);
// 			}else{
// 				$.showInforDlg('提示','获取时间失败！',7);
// 			}	
// 			console.log(err);
// 		},
// 		complete: () => {
// 			
// 		}
// 	})
// }
function setTime(){ //设置时间
	//当前本地时间
	let thisDate = new Date();
	//获取年月日时分秒
	let y = thisDate.getFullYear();
	let m = thisDate.getMonth() + 1 > 9 ? thisDate.getMonth() + 1 : '0' + (thisDate.getMonth() + 1);
	let d = thisDate.getDate() > 9 ? thisDate.getDate() : '0' + thisDate.getDate();
	let h = thisDate.getHours() > 9 ? thisDate.getHours() : '0' + thisDate.getHours();
	let mi = thisDate.getMinutes() > 9 ? thisDate.getMinutes() : '0' + thisDate.getMinutes();
	let s = thisDate.getSeconds() > 9 ? thisDate.getSeconds() : '0' + thisDate.getSeconds();

	//拼接
	let y_m_d = y + '年' + m + '月' + d + '日';
	let h_m_s = h + ':' + mi + ':' + s;
	
	$('#topBox_date').text(y_m_d); //年月日
	$('#topBox_time').text(h_m_s); //时分秒
	
	setTimeout( () => {
		setTime();
	}, 1000);
	
}

function getMenuUnitList(){ //获取自定义菜单运用所下拉选
	// $.ajax({
	// 	url: request_api + '/qualityManage/getUnitInfo',
	// 	data: {
			
	// 	},
	// 	type: 'post',
	// 	dataType: 'json',
	// 	async: false,
	// 	success: res => {
	// 		console.log(res);
	// 		let getData = res;
			let getData = [
				{
					unitValue: '123',
					unitCode: '123',
					unitName: '南京动车段'
				},
				{
					unitValue: '123',
					unitCode: '123',
					unitName: '南京动车段'
				},
				{
					unitValue: '123',
					unitCode: '123',
					unitName: '南京动车段'
				},
			];
			let obj = '';
			for(let item of getData){
				obj += '<option value="' + item.unitCode + '" data-unitvalue="' + item.unitValue + '">' + item.unitName + '</option>';
			}
			$('#menu_select').children().remove();
			$('#menu_select').append(obj);
	// 	},
	// 	error: err => {
	// 		if(err.readyState == 0){
	// 			$.showInforDlg('提示','网络异常，请检查网络！',2);
	// 		}else{
	// 			$.showInforDlg('提示','获取运用所失败！',7);
	// 		}
	// 		console.log(err);
	// 	},
	// 	complete: () => {
			
	// 	}
	// })
}

function getBasisTable(){ //获取基础作业
	//当前本地时间
	let myDate = new Date();
	//一天前的时间
	let thisDate = new Date(myDate - 1000 * 60 * 60 * 24 * 1)
	//获取年月日时分秒
	let y = thisDate.getFullYear();
	let m = thisDate.getMonth() + 1 > 9 ? thisDate.getMonth() + 1 : '0' + (thisDate.getMonth() + 1);
	let d = thisDate.getDate() > 9 ? thisDate.getDate() : '0' + thisDate.getDate();
	let h = thisDate.getHours() > 9 ? thisDate.getHours() : '0' + thisDate.getHours();
	let mi = thisDate.getMinutes() > 9 ? thisDate.getMinutes() : '0' + thisDate.getMinutes();
	let s = thisDate.getSeconds() > 9 ? thisDate.getSeconds() : '0' + thisDate.getSeconds();
	
	let date = y + '-' + m + '-' + d;
	let thisTime = y + '-' + m + '-' + d + ' ' + h + ':' + mi + ':' + s;
	// $.ajax({
	// 	url: request_api + '/QcMJobDiary/getData',
	// 	data: {
	// 		date: date,
	// 		type: 1,
	// 		thisTime: thisTime,
	// 	},
	// 	type: 'post',
	// 	dataType: 'json',
	// 	success: res => {
	// 		console.log(res);
	// 		basisTableData = res;
			basisTableData = {
				"rows":{
					"accessoryInspection":"",
					"dayShiftUnitList":[
						{
							"unitName":"南京动车组",
							"unitNum":"0"
						},
						{
							"unitName":"南京南动车组",
							"unitNum":"7"
						},
						{
							"unitName":"合肥南动车组",
							"unitNum":"0"
						},
						{
							"unitName":"徐州东动车组",
							"unitNum":"0"
						}
					],
					"faultConfirmation":[],
					"list":[
						{
							"dayOqId":"",
							"dayShiftJobCondition":"",
							"dayShiftTrySetNum":"0",
							"itemId":"5f15ef9107344b5c9caa6661fa2deb66",
							"itemName":"项目名称项目名称",
							"nightOqId":"",
							"nightShiftJobCondition":"",
							"nightShiftTrySetNum":"0"
						},
						{
							"dayOqId":"",
							"dayShiftJobCondition":"",
							"dayShiftTrySetNum":"6",
							"itemId":"8e28eae5eaea47be97f4adb386dc26f3",
							"itemName":"测试项目",
							"nightOqId":"",
							"nightShiftJobCondition":"",
							"nightShiftTrySetNum":"0"
						}
					],
					"nightFaultConfirmation":[],
					"nightRest":"",
					"nightRework":[],
					"nightShiftUnitList":[
						{
							"unitName":"南京动车组运用所",
							"unitNum":"0"
						},
						{
							"unitName":"南京南动车组运用所",
							"unitNum":"0"
						},
						{
							"unitName":"合肥南动车组运用所",
							"unitNum":"0"
						},
						{
							"unitName":"徐州东动车组运用所",
							"unitNum":"0"
						}
					],
					"planId":"2019-10-15",
					"remark":"",
					"rest":"",
					"rework":[],
					"sJobDiaryId":"",
					"sStatus":"0",
					"top1":"南京动车段  动车运用所",
					"top2":"动车运用所质检报告",
					"top3":"上铁辆记-动-087-2014",
					"trySetId":"",
					"whickWork":"00"
				},
				"status":"1"
			}
			setBasisTable(); //基础作业表格渲染
		// },
		// error: err => {
		// 	if(err.readyState == 0){
		// 		$.showInforDlg('提示','网络异常，请检查网络！',2);
		// 	}else{
		// 		$.showInforDlg('提示','获取基础作业失败！',7);
		// 	}
		// 	console.log(err);
		// },
		// complete: () => {
			
		// }
	// })
}
function setBasisTable(){ //基础作业表格渲染
	let getData = basisTableData.rows;
	let obj = '';
	let day_night; //白班还是夜班字符串
	let shiftUnitList; //当班质检员行要遍历的数据
	let faultConfirmation; //重点故障信息
	let rework; //返工返修及停工整改情况
	let rest; //其他重点事项
	//加判断，只展示当前时间的班次数据
	if(getData.whickWork == '00'){ //白班
		day_night = '白班';
		shiftUnitList = getData.dayShiftUnitList;
		faultConfirmation = getData.faultConfirmation;
		rework = getData.rework;
		rest = getData.rest;
	}else{ //夜班
		day_night = '夜班';
		shiftUnitList = getData.nightShiftUnitList;
		faultConfirmation = getData.nightFaultConfirmation;
		rework = getData.nightRework;
		rest = getData.nightRest;
	}
	//表头
	obj += '<tr>';
	obj += '	<th colspan="5">' + getData.top1 + '&nbsp;&nbsp;' + getData.top2 + '</th>';
	obj += '	<th colspan="5">' + getData.top3 + '</th>';
	obj += '</tr>';
	obj += '<tr>';
	obj += '	<td colspan="5">日期&nbsp;&nbsp;' + getData.planId + '</td>';
	obj += '	<td colspan="5">' + day_night + '</td>';
	obj += '</tr>';
	
	//当班质检员
	obj += '<tr>';
	obj += '	<td colspan="2" rowspan="2">当班质检员</td>';
	for(let item of shiftUnitList){
		obj += '<td colspan="2">' + item.unitName + '</td>';
	}
	obj += '</tr>';
	obj += '<tr>';
	for(let item of shiftUnitList){
		obj += '<td colspan="2">' + item.unitNum + '</td>';
	}
	obj += '</tr>';
	//作业质量检查情况
	obj += '<tr>';
	obj += '	<td colspan="2" rowspan="' + (getData.list.length+1) + '">作业质量检查情况</td>';
	obj += '	<td colspan="4">作业项目</td>';
	obj += '	<td colspan="2">检查车组号</td>';
	obj += '	<td colspan="2">作业质量</td>';
	obj += '</tr>';
	for(let item of getData.list){
		let shiftTrySetNum; //检查车组号
		let shiftJobCondition; //作业质量
		if(getData.whickWork == '00'){ //白班
			shiftTrySetNum = item.dayShiftTrySetNum;
			shiftJobCondition = item.dayShiftJobCondition == '' ? '正常' : item.dayShiftJobCondition;
		}else{ //夜班
			shiftTrySetNum = item.nightShiftTrySetNum;
			shiftJobCondition = item.nightShiftJobCondition == '' ? '正常' : item.nightShiftJobCondition;
		}
		obj += '<tr>';
		obj += '	<td colspan="4">' + item.itemName + '</td>';
		obj += '	<td colspan="2">' + shiftTrySetNum + '</td>';
		obj += '	<td colspan="2">' + shiftJobCondition + '</td>';
		obj += '</tr>';
	}
	
	obj += '<tr>';
	obj += '	<td colspan="2">鉴定车组</td>';
	obj += '	<td colspan="8">' + getData.trySetId + '</td>';
	obj += '</tr>';
	
	obj += '<tr>';
	obj += '	<td colspan="2">重点故障信息<br>重点故障确认信息</td>';
	obj += '	<td colspan="8">';
	for(let item of faultConfirmation){
		obj += '<p>' + item.infoName + '</p>';
	}
	obj += '	</td>';
	obj += '</tr>';
	
	obj += '<tr>';
	obj += '	<td colspan="2">配件质量检车情况</td>';
	obj += '	<td colspan="8">' + getData.accessoryInspection + '</td>';
	obj += '</tr>';
	
	obj += '<tr>';
	obj += '	<td colspan="2">返工返修及停工整改情况</td>';
	obj += '	<td colspan="8">';
	for(let item of rework){
		obj += '<p>' + item.infoName + '</p>';
	}
	obj += '	</td>';
	obj += '</tr>';
	
	obj += '<tr>';
	obj += '	<td colspan="2">其他重点事项</td>';
	obj += '	<td colspan="8">';
	obj += '		<p>' + rest + '</p>';
	obj += '	</td>';
	obj += '</tr>';
	
	obj += '<tr>';
	obj += '	<td colspan="2">备注</td>';
	obj += '	<td colspan="8">' + getData.remark + '</td>';
	obj += '</tr>';
	
	$('#basisWork_table').children().remove();
	$('#basisWork_table').append(obj);
	
	if(basisTableTiming != null){
		clearInterval(basisTableTiming); //清除定时器
	}
	
	let timing = localStorage.getItem('bottomLineTiming');
	if(timing != '暂停'){
		basisTableTiming = setInterval( () => {
			setBasisTablefn(); //基础作业轮播事件
		}, parseInt(timing));
	}
	
}

function setBasisTablefn(){ //基础作业轮播事件-按高度
	let parentHeight = $('#basisWork_table').parent()[0].clientHeight; //列表父节点的高
	let listHeight = $('#basisWork_table')[0].clientHeight; //列表的高
	let listTop = $('#basisWork_table')[0].offsetTop; //列表当前y轴位移
	let nextTop = listTop - parentHeight; //列表轮播后位移
	//列表高-列表y轴位移，小于等于父节点高 -> 最后一项了
	if(listHeight - Math.abs(listTop) <= parentHeight){
		// clearInterval(basisTableTiming); //清除计时器
		// getBasisTable(); //更新基础作业
		nextTop = 0; //列表轮播后位移
	}
	$('#basisWork_table').css({ //下一组
		'top': nextTop + 'px',
	})
}

function getPhotoList(){ //获取质量监控-照片列表
	//当前本地时间
	let thisDate = new Date();
	//获取年月日时分秒
	let y = thisDate.getFullYear();
	let m = thisDate.getMonth() + 1 > 9 ? thisDate.getMonth() + 1 : '0' + (thisDate.getMonth() + 1);
	let d = thisDate.getDate() > 9 ? thisDate.getDate() : '0' + thisDate.getDate();
	let h = thisDate.getHours() > 9 ? thisDate.getHours() : '0' + thisDate.getHours();
	let mi = thisDate.getMinutes() > 9 ? thisDate.getMinutes() : '0' + thisDate.getMinutes();
	let s = thisDate.getSeconds() > 9 ? thisDate.getSeconds() : '0' + thisDate.getSeconds();
	let thisTime = y + '-' + m + '-' + d + ' ' + h + ':' + mi + ':' + s;
	let unitcode = $('#menu_select').val(); //运用所code
	let unitName = $('#menu_select option:selected').text(); //运用所name
	// $.ajax({
	// 	url: request_api + '/qualityManage/getPeoImgInfo2',
	// 	data: {
	// 		unitName: unitName,
	// 		unitcode: unitcode,
	// 		thisTime: thisTime,
	// 	},
	// 	type: 'post',
	// 	dataType: 'json',
	// 	success: res => {
	// 		console.log(res);
	// 		photoListData = res;
			photoListData = [
				{
					"group":[
						{
							"a_num":0,
							"b_num":0,
							"belongGroup":"质检组",
							"c_num":0,
							"code":"00595001084",
							"deptCode":"0059500686",
							"imgSrc":"/static/img/checkManage/people.png",
							"name":"王俊",
							"score":0.0,
							"type":"2",
							"unitCode":"029",
							"unitName":"南京南运用所"
						},
						{
							"a_num":0,
							"b_num":0,
							"belongGroup":"质检组",
							"c_num":0,
							"code":"00595001813",
							"deptCode":"0059500686",
							"imgSrc":"/static/img/checkManage/people.png",
							"name":"费晶鑫",
							"score":0.0,
							"type":"2",
							"unitCode":"029",
							"unitName":"南京南运用所"
						},
						{
							"a_num":0,
							"b_num":0,
							"belongGroup":"质检组",
							"c_num":0,
							"code":"00595000947",
							"deptCode":"0059500686",
							"imgSrc":"/static/img/checkManage/people.png",
							"name":"陈正国",
							"score":0.0,
							"type":"2",
							"unitCode":"029",
							"unitName":"南京南运用所"
						}
					]
				},
				{
					"group":[
						{
							"a_num":0,
							"b_num":0,
							"belongGroup":"质检组",
							"c_num":0,
							"code":"00595000960",
							"deptCode":"0059500686",
							"imgSrc":"/static/img/checkManage/people.png",
							"name":"薛忠",
							"score":0.0,
							"type":"2",
							"unitCode":"029",
							"unitName":"南京南运用所"
						},
						{
							"a_num":0,
							"b_num":0,
							"belongGroup":"质检组",
							"c_num":0,
							"code":"00596005426",
							"deptCode":"0059500686",
							"imgSrc":"/static/img/checkManage/people.png",
							"name":"杨平",
							"score":0.0,
							"type":"2",
							"unitCode":"029",
							"unitName":"南京南运用所"
						},
						{
							"a_num":0,
							"b_num":0,
							"belongGroup":"质检组",
							"c_num":0,
							"code":"00596005465",
							"deptCode":"0059500686",
							"imgSrc":"/static/img/checkManage/people.png",
							"name":"凌康",
							"score":0.0,
							"type":"2",
							"unitCode":"029",
							"unitName":"南京南运用所"
						}
					]
				}
			];
			
			let obj = '';
			for(let wapper of photoListData){
				obj += '<ul class="swiper-slide">';
				for(let item of wapper.group){
					//工作中(绿)、休整(红)、待作业(黄)
					let workImg;
					let orWork;
					if(item.type == '1'){ //工作中
						workImg = '/static/img/checkManage/icon_work.png';
						orWork = '工作中';
					}else if(item.type == '2'){ //休整
						workImg = '/static/img/checkManage/icon_relax.png';
						orWork = '休整';
					}else{ //待作业
						workImg = '/static/img/checkManage/icon_loadWork.png';
						orWork = '待作业';
					}
					obj += '<li class="photoEle" data-code="' + item.code + '">';
					obj += '	<img src="' + item.imgSrc + '" onerror="photoError(this);"/>';
					obj += '	<p class="photo_work">';
					obj += '		<img src="' + workImg + '" class="photo_statusImg" />';
					obj += '		<span class="photo_statusWord">' + orWork + '</span>';
					obj += '	</p>';
					obj += '</li>';
				}
				obj += '</ul>';
			}
			
			//如果存在轮播实例 - 先销毁->更新数据->重新加载swiper
			if(swiper_photoList != null){
				swiper_photoList.destroy(); //销毁
			}
			
			$('#photoBox .swiper-wrapper').children().remove();
			$('#photoBox .swiper-wrapper').append(obj);
			if(photoListData.length != 0){
				//加载swiper
				swiper_photoList = new Swiper('#photoBox', {
				   direction: 'horizontal', //切换选项 垂直：vertical， 水平：horizontal
				   loop: true, //循环模式选项
				   autoplay: false,
				   grabCursor: true, //鼠标覆盖Swiper时指针会变成手掌形状，拖动时指针会变成抓手形状
				   slidesPerView: 1, //设置slider容器能够同时显示的slides数量
				   slidesPerGroup: 1, //定义slides的数量多少为一组
				   spaceBetween: 2,
				   effect: 'slide', //切换效果，默认为"slide"（位移切换），可设置为'slide'（普通切换、默认）,"fade"（淡入）"cube"（方块）"coverflow"（3d流）"flip"（3d翻转）
				   loop: true, //设置为true 则开启loop模式。loop模式：会在原本slide前后复制若干个slide(默认一个)并在合适的时候切换，让Swiper看起来是循环的。 loop模式在与free模式同用时会产生抖动，因为free模式下没有复制slide的时间点
				   loopFillGroupWithBlank: true, //在loop模式下，为group填充空白slide
				   observer:true, //修改swiper自己或子元素时，自动初始化swiper 
				   observeParents:false, //修改swiper的父元素时，自动初始化swiper 
				})
				
				//启用了swiper的loop模式
				//为了展示下一组可以一直调用slideNext方法，否则展示最后一组后slideNext方法失效，就要多一个判断
				//默认选中第一个-当前展示组(ul)的第一个
				$('#photoBox .swiper-slide-active .photoEle:eq(0)').addClass('photoActive');
			}
			
			photoRelation(); //和照片列表相关联的事件
			//照片列表为空
			if(photoListData.length == 0){
				clearInterval(photoTiming); //清除定时器
			}else{
				setPhotoTiming(); //设置照片定时器
			}
			
		// },
		// error: err => {
		// 	if(err.readyState == 0){
		// 		$.showInforDlg('提示','网络异常，请检查网络！',2);
		// 	}else{
		// 		$.showInforDlg('提示','获取职工照片列表失败！',7);
		// 	}
		// 	console.log(err);
		// },
		// complete: () => {
		// 	layer.closeAll('loading');
		// }
	// })
}

function setPhotoTiming(){ //设置照片定时器
	if(photoTiming != null){
		clearInterval(photoTiming); //清除定时器
	}
	//照片轮播时间
	let localStorage_photoTiming = localStorage.getItem('photoTiming');
	if(localStorage_photoTiming != '暂停'){
		photoTiming = setInterval( () => {
			photoTimingFn(); //变化照片选中状态
		}, parseInt(localStorage_photoTiming));
	}
}

function photoTimingFn(){ //变化照片选中状态
	let photoNextEle = $('.photoActive').next(); //当前选中的下一个节点
	//当前选中的下一个节点为空，表示当前选中的是该组最后一个
	if(photoNextEle.length == 0){
		//当前展示组的下标
		let thidGroupIndex = $('.photoActive').parent().data('swiper-slide-index');
		//当前展示组的下标和照片组数最后一个下标相同 -> 当前是最后一组了 -> 刷新照片列表
		if(thidGroupIndex == photoListData.length-1){
			getPhotoList(); //刷新质量监控-照片列表
			return false;
		}
		swiper_photoList.slideNext(); //下一组
		//展示组的第一个节点
		photoNextEle = $('#photoBox .swiper-slide-active .photoEle:eq(0)');
	}
	photoNextEle.click();
}

function photoRelation(){ //和照片列表相关联的事件
	if(photoListData.length == 0 || photoListData == null){ //没有照片列表
		$('.photoData_nameBox').hide(); //隐藏照片信息
		$('.photoData_dataBox').hide(); //隐藏雷达图
		$('.check_botContent_tableHead').hide(); //隐藏当前返工返修单表头
		$('.check_botContent_tableEleBox').hide(); //隐藏当前返工返修单表格
		$('#workingList0').hide(); //隐藏正在作业
		$('#workingList1').hide(); //隐藏待作业
		$('#workingList2').hide(); //隐藏已完成作业
		
		//添加暂无数据
		$('#photoBox .swiper-wrapper').append(data_none); //照片列表
		$('.photoDataBox').append(data_none); //照片信息和雷达图
		$('.check_botContent_tableList').append(data_none); //当前月返修单列表
		$('#threeList').append(data_none); //正在作业、待作业、已完成作业
		return;
	}else{
		$('.photoData_nameBox').show(); //取消隐藏照片信息
		$('.photoData_dataBox').show(); //取消隐藏雷达图
		$('.check_botContent_tableHead').show(); //取消隐藏当前返工返修单表头
		$('.check_botContent_tableEleBox').show(); //取消隐藏当前返工返修单表格
		$('#workingList0').show(); //取消隐藏正在作业
		$('#workingList1').show(); //取消隐藏待作业
		$('#workingList2').show(); //取消隐藏已完成作业
		
		//删除暂无数据
		$('#photoBox .swiper-wrapper').find('.data_none').remove(); //照片列表
		$('.photoDataBox').find('.data_none').remove(); //照片信息和雷达图
		$('.check_botContent_tableList').find('.data_none').remove(); //当前月返修单列表
		$('#threeList').find('.data_none').remove(); //正在作业、待作业、已完成作业
	}
	setPhotoInfo(); //照片信息 - add：照片下的状态更新、照片信息中的分数和ABC更新
	getPhotoStatistics(); //获取雷达图数据
	getThisMonthReworkTable(); //获取质量监控-当前月返工返修单列表
	getWorkThreeList(); //获取质量监控-三个列表（正在作业、待作业、已完成作业）
}

function setPhotoInfo(){ //照片信息 - add：照片下的状态更新、照片信息中的分数和ABC更新

	// //清空内容
	// $('#photoScore').text(''); //分数
	// $('#photoNumA').text(''); //A
	// $('#photoNumB').text(''); //B
	// $('#photoNumC').text(''); //C
	// //清空选中照片状态
	// $('#photoBox .photoActive .photo_statusImg').attr('src', '');
	// $('#photoBox .photoActive .photo_statusWord').text('');

	let personCode = $('.photoActive').data('code'); //选中的code
	let unitCode; //运用所code
	for(let wapper of photoListData){
		for(let item of wapper.group){
			if(item.code == personCode){
				$('#photoName').text(item.name); //姓名
				$('#photoUnit').text(item.unitName); //运用所
				$('#photoGroup').text(item.belongGroup); //质检组
				unitCode = item.unitCode;
			}
		}
	}
	// $.ajax({
	// 	url: request_api + '/qualityManage/getWorkType',
	// 	data: {
	// 		plandId: thisPlanId,
	// 		stuffCode: personCode,
	// 		unitCode: unitCode,
	// 	},
	// 	type: 'post',
	// 	dataType: 'json',
	// 	success: res => {
	// 		console.log(res);
	// 		let getData = res;
	// 		$('#photoScore').text(getData.score); //分数
	// 		$('#photoNumA').text(getData.a_num); //A
	// 		$('#photoNumB').text(getData.b_num); //B
	// 		$('#photoNumC').text(getData.c_num); //C
	// 		//工作中(绿)、休整(红)、待作业(黄)
	// 		let workImg;
	// 		let orWork;
	// 		if(getData.type == '1'){ //工作中
	// 			workImg = '/static/img/checkManage/icon_work.png';
	// 			orWork = '工作中';
	// 		}else if(getData.type == '2'){ //休整
	// 			workImg = '/static/img/checkManage/icon_relax.png';
	// 			orWork = '休整';
	// 		}else{ //待作业
	// 			workImg = '/static/img/checkManage/icon_loadWork.png';
	// 			orWork = '待作业';
	// 		}
	// 		//更新选中照片状态
	// 		$('#photoBox .photoActive .photo_statusImg').attr('src', workImg);
	// 		$('#photoBox .photoActive .photo_statusWord').text(orWork);
	// 	},
	// 	error: err => {
	// 		if(err.readyState == 0){
	// 			$.showInforDlg('提示','网络异常，请检查网络！',2);
	// 		}else{
	// 			$.showInforDlg('提示','更新职工照片信息失败！',7);
	// 		}
	// 		console.log(err);
	// 	},
	// 	complete: () => {
			
	// 	}
	// })
	
}

//ABC返修单点击事件
// $(document).on('click', '#photoNumA,#photoNumB,#photoNumC', e => {
// 	if(e.currentTarget.innerText == '0'){ //0分，不弹窗
// 		return false;
// 	}
// 	getRework_ABC(e); //返修单数量弹窗数据
// });

// function getRework_ABC(e){ //返修单数量弹窗数据
// 	let unitCode = $('#menu_select').val(); //运用所code
// 	let sQcCode = $('.photoActive').data('code'); //人员code
// 	$.ajax({
// 		url: request_api + '/rework/getReworkcord',
// 		data: {
// 			sFaultLevel: e.currentTarget.dataset.sfaultlevel,
// 			sQcCode: sQcCode,
// 			sUnitCode: unitCode,
// 		},
// 		type: 'post',
// 		dataType: 'json',
// 		success: res => {
// 			console.log(res);
// 			let getData = res.zzReworkRecords;
// 			let obj = '';
// 			for(let i=0; i<getData.length; i++){
// 				let item = getData[i];
// 				obj += '<div class="peoGroupDetailPopContentList_listBox">';
// 				obj += '	<p><span>序号：</span><span>' + (i+1) + '</span></p>';
// 				obj += '	<p><span>车组号：</span><span>' + item.sTrainSetName + '</span></p>';
// 				obj += '	<p><span>问题名称：</span><span>' + item.sFaultName + '</span></p>';
// 				obj += '	<p><span>处理班组：</span><span>' + item.sProcessDeptName + '</span></p>';
// 				obj += '	<p><span>处理人：</span><span>' + item.sProcessStuffName + '</span></p>';
// 				obj += '	<p><span>处理时间：</span><span>' + item.dProcessTime + '</span></p>';
// 				obj += '	<p><span>备注：</span><span>' + item.sRemark + '</span></p>';
// 				obj += '</div>';
// 			}
// 			$('#peoGroupDetailPopContentList_listBox').children().remove();
// 			$('#peoGroupDetailPopContentList_listBox').append(obj);
// 		},
// 		error: err => {
// 			if(err.readyState == 0){
// 				$.showInforDlg('提示','网络异常，请检查网络！',2);
// 			}else{
// 				$.showInforDlg('提示','返修单数量详情获取失败！',7);
// 			}
// 			console.log(err);
// 		},
// 		complete: () => {
			
// 		}
// 	})
// }

function getWorkThreeList(){ //获取质量监控-三个列表（正在作业、待作业、已完成作业
	let stuffCode = $('.photoActive').data('code'); //人员code
	let unitCode; //运用所code
	for(let wapper of photoListData){
		for(let item of wapper.group){
			if(item.code == stuffCode){
				unitCode = item.unitCode;
			}
		}
	}
	//当前本地时间
	let thisDate = new Date();
	//获取年月日时分秒
	let y = thisDate.getFullYear();
	let m = thisDate.getMonth() + 1 > 9 ? thisDate.getMonth() + 1 : '0' + (thisDate.getMonth() + 1);
	let d = thisDate.getDate() > 9 ? thisDate.getDate() : '0' + thisDate.getDate();
	let thisDay = y + '-' + m + '-' + d;
	// $.ajax({
	// 	url: request_api + '/interfaces/getItemType',
	// 	data: {
	// 		unitCode: unitCode,
	// 		stuffCode: stuffCode,
	// 		startDate: thisDay,
	// 		endDate: thisDay,
	// 	},
	// 	type: 'post',
	// 	dataType: 'json',
	// 	success: res => {
	// 		console.log(res);
	// 		let getData = res;
			let getData = [
				{
					listStatus: 1, //区分 正在作业、待作业、已完成作业
					list:[
						{
							sTrainSetName: 'CRH1A1111',
							sItemName: '空心车轴探伤',
							sCheckMode: '检修',
							startTime: '2019-10-10  09:09:09',
							endTime: '2019-10-10  09:09:09'
						},
						{
							sTrainSetName: 'CRH1A2222',
							sItemName: '空心车轴探伤',
							sCheckMode: '检修',
							startTime: '2019-10-10  09:09:09',
							endTime: '2019-10-10  09:09:09'
						},
						{
							sTrainSetName: 'CRH1A3333',
							sItemName: '空心车轴探伤',
							sCheckMode: '检修',
							startTime: '2019-10-10  09:09:09',
							endTime: '2019-10-10  09:09:09'
						}
					]
				},
				{
					listStatus: 2,
					list:[
						{
							sTrainSetName: 'CRH1A1111',
							sItemName: '空心车轴探伤',
							sCheckMode: '检修',
							startTime: '2019-10-10  09:09:09',
							endTime: '2019-10-10  09:09:09'
						},
						{
							sTrainSetName: 'CRH1A2222',
							sItemName: '空心车轴探伤',
							sCheckMode: '检修',
							startTime: '2019-10-10  09:09:09',
							endTime: '2019-10-10  09:09:09'
						}
					]
				},
				{
					listStatus: 3,
					list:[
						{
							sTrainSetName: 'CRH1A1111',
							sItemName: '空心车轴探伤',
							sCheckMode: '检修',
							startTime: '2019-10-10  09:09:09',
							endTime: '2019-10-10  09:09:09'
						},
						{
							sTrainSetName: 'CRH1A2222',
							sItemName: '空心车轴探伤',
							sCheckMode: '检修',
							startTime: '2019-10-10  09:09:09',
							endTime: '2019-10-10  09:09:09'
						},
						{
							sTrainSetName: 'CRH1A3333',
							sItemName: '空心车轴探伤',
							sCheckMode: '检修',
							startTime: '2019-10-10  09:09:09',
							endTime: '2019-10-10  09:09:09'
						},
						{
							sTrainSetName: 'CRH1A4444',
							sItemName: '空心车轴探伤',
							sCheckMode: '检修',
							startTime: '2019-10-10  09:09:09',
							endTime: '2019-10-10  09:09:09'
						},
						{
							sTrainSetName: 'CRH1A5555',
							sItemName: '空心车轴探伤',
							sCheckMode: '检修',
							startTime: '2019-10-10  09:09:09',
							endTime: '2019-10-10  09:09:09'
						}
					]
				},
			];
			//如果存在轮播实例 - 先销毁->更新数据->重新加载swiper
			if(swiper_workingList0 != null){
				swiper_workingList0.destroy(); //销毁
			}
			if(swiper_workingList1 != null){
				swiper_workingList1.destroy(); //销毁
			}
			if(swiper_workingList2 != null){
				swiper_workingList2.destroy(); //销毁
			}
			let obj = '';
			for(let i=0; i<getData.length; i++){
				let listName; //列表标题
				let listNameColor; //标题颜色
				if(getData[i].listStatus == 1){ //正在作业
					listName = '正在作业';
					listNameColor = 'fontColor_12db6a';
				}else if(getData[i].listStatus == 3){ //已完成作业
					listName = '已完成作业';
					listNameColor = 'fontColor_22fce7';
				}else{ //待作业
					listName = '待作业';
					listNameColor = 'fontColor_ffde38';
				}
				obj += '<div class="smallEle_bgColor smallEle_dashed">';
				obj += '	<p class="bgTitle ' + listNameColor + '">';
				obj += '		<span>' + listName + '</span>';
				obj += '		<span>总数：' + getData[i].list.length + '</span>';
				obj += '	</p>';
				obj += '	<div class="check_botContent_threeList_content swiper-container" id="workingList' + i + '">';
				obj += '		<ul class="swiper-wrapper">';
				for(let item of getData[i].list){
					obj += '<li class="swiper-slide">';
					obj += '	<div class="check_botContent_threeList_content_top">';
					obj += '		<p>';
					obj += '			<span>车组号：</span><span>' + item.sTrainSetName + '</span>';
					obj += '		</p>';
					obj += '		<p>';
					obj += '			<span>作业项目：</span><span>' + item.sItemName + '</span>';
					obj += '		</p>';
					obj += '		<p>';
					obj += '			<span>完成状态：</span><span>' + listName + '</span>';
					obj += '		</p>';
					obj += '		<p>';
					obj += '			<span>质检方式：</span><span>' + item.sCheckMode + '</span>';
					obj += '		</p>';
					obj += '	</div>';
					obj += '	<div class="check_botContent_threeList_content_bottom">';
					obj += '		<p>';
					obj += '			<span>开始时间：</span>';
					obj += '			<span>' + item.startTime + '</span>';
					obj += '		</p>';
					obj += '		<p>';
					obj += '			<span>结束时间：</span>';
					obj += '			<span>' + item.endTime + '</span>';
					obj += '		</p>';
					obj += '	</div>';
					obj += '</li>';
				}
				obj += '		</ul>';
				obj += '	</div>';
				obj += '</div>';
			}
			$('#threeList').children().remove();
			$('#threeList').append(obj);
			
			let swiperConfig = { //swiper轮播配置
				direction: 'vertical', //切换选项 垂直：vertical， 水平：horizontal
				loop: true, //循环模式选项
				autoplay: {
					delay: photoRelationTiming, //自动切换的时间间隔
					disableOnInteraction: false, //用户操作swiper之后，是否禁止autoplay。默认为true：停止。
				},
				grabCursor: true, //鼠标覆盖Swiper时指针会变成手掌形状，拖动时指针会变成抓手形状
				slidesPerView: 1, //设置slider容器能够同时显示的slides数量
				slidesPerGroup: 1, //定义slides的数量多少为一组
				spaceBetween: 0,
				effect: 'slide', //切换效果，默认为"slide"（位移切换），可设置为'slide'（普通切换、默认）,"fade"（淡入）"cube"（方块）"coverflow"（3d流）"flip"（3d翻转）
				loop: true, //设置为true 则开启loop模式。loop模式：会在原本slide前后复制若干个slide(默认一个)并在合适的时候切换，让Swiper看起来是循环的。 loop模式在与free模式同用时会产生抖动，因为free模式下没有复制slide的时间点
				loopFillGroupWithBlank: true, //在loop模式下，为group填充空白slide
				observer:true, //修改swiper自己或子元素时，自动初始化swiper 
				observeParents:false, //修改swiper的父元素时，自动初始化swiper 
			}
			//加载swiper
			if(getData[0].list.length > 1){
				swiper_workingList0 = new Swiper('#workingList0', swiperConfig);
			}
			if(getData[1].list.length > 1){
				swiper_workingList1 = new Swiper('#workingList1', swiperConfig);
			}
			if(getData[2].list.length > 1){
				swiper_workingList2 = new Swiper('#workingList2', swiperConfig);
			}
		// },
		// error: err => {
		// 	if(err.readyState == 0){
		// 		$.showInforDlg('提示','网络异常，请检查网络！',2);
		// 	}else{
		// 		$.showInforDlg('提示','正在作业、待作业、已完成作业获取失败！',7);
		// 	}
		// 	console.log(err);
		// },
		// complete: () => {
			
		// }
	// })
}

function getMinList(){ //获取关键配件跟踪列表
	//当前本地时间
	let thisDate = new Date();
	//获取年月日时分秒
	let y = thisDate.getFullYear();
	let m = thisDate.getMonth() + 1 > 9 ? thisDate.getMonth() + 1 : '0' + (thisDate.getMonth() + 1);
	let d = thisDate.getDate() > 9 ? thisDate.getDate() : '0' + thisDate.getDate();
	let time = y + '-' + m + '-' + d;
	// $.ajax({
	// 	url: request_api + '/InforMation/selectAllToMation',
	// 	data: {
	// 		strTime: time,
	// 		endTime: time,
	// 	},
	// 	type: 'post',
	// 	dataType: 'json',
	// 	success: res => {
	// 		console.log(res);
	// 		let getData = res.rows;
			let getData = [
				{
					"inforMationName":"这是测试数据1",
					"sUnitName":"南京动车段",
					"addTime":"2019-10-17 16:00:09",
					"sUnitCode":"00596",
					"addName":"凌康",
					"id":"83a3b3e4d2d14289992b317e8e8e52b1",
					"addCode":"00595000930"
				},
				{
					"inforMationName":"这是测试数据2",
					"sUnitName":"南京动车段",
					"addTime":"2019-10-17 16:00:09",
					"sUnitCode":"00596",
					"addName":"凌康",
					"id":"b247388194bf4ccc8bfeebea2992856a",
					"addCode":"00595000930"
				},
				{
					"inforMationName":"这是测试数据3",
					"sUnitName":"南京动车段",
					"addTime":"2019-10-17 16:00:08",
					"sUnitCode":"00596",
					"addName":"凌康",
					"id":"21593ec0ed0e44a0b3f0908c55fda533",
					"addCode":"00595000930"
				},
				{
					"inforMationName":"这是测试数据4",
					"sUnitName":"南京动车段",
					"addTime":"2019-10-17 16:00:08",
					"sUnitCode":"00596",
					"addName":"凌康",
					"id":"e53a32a9d7324b84a6d4657c75c158c2",
					"addCode":"00595000930"
				},
				{
					"inforMationName":"这是测试数据5",
					"sUnitName":"南京动车段",
					"addTime":"2019-10-17 16:00:07",
					"sUnitCode":"00596",
					"addName":"凌康",
					"id":"3f3a1884fb1e4162b5460ff3ac1ac5dd",
					"addCode":"00595000930"
				},
				{
					"inforMationName":"这是测试数据6",
					"sUnitName":"南京动车段",
					"addTime":"2019-10-17 16:00:07",
					"sUnitCode":"00596",
					"addName":"凌康",
					"id":"9d5c10e5d2d048339ba38f5ef25f3279",
					"addCode":"00595000930"
				},
				{
					"inforMationName":"这是测试数据7",
					"sUnitName":"南京动车段",
					"addTime":"2019-10-17 16:00:04",
					"sUnitCode":"00596",
					"addName":"凌康",
					"id":"c1f91f3c2ed543b7be62ff14af85a7d3",
					"addCode":"00595000930"
				},
				{
					"inforMationName":"这是测试数据8",
					"sUnitName":"南京动车段",
					"addTime":"2019-10-17 16:00:01",
					"sUnitCode":"00596",
					"addName":"凌康",
					"id":"f4496c6fbe9045358d1d3dfc4b0c00f4",
					"addCode":"00595000930"
				},
				{
					"inforMationName":"这是测试数据9",
					"sUnitName":"南京动车段",
					"addTime":"2019-10-17 16:00:01",
					"sUnitCode":"00596",
					"addName":"凌康",
					"id":"f4496c6fbe9045358d1d3dfc4b0c00f4",
					"addCode":"00595000930"
				}
			];
			let obj = '';
			for(let i=0; i<getData.length; i++){
				obj += '<li >';
				obj += '	<span>' + (i+1) + '</span>';
				obj += '	<p>' + getData[i].inforMationName + '</p>';
				obj += '</li>';
			}
			$('#mainList').children().remove();
			$('#mainList').append(obj);
			
			if(mainListTiming != null){
				clearInterval(mainListTiming); //清除计时器
			}
			let timing = localStorage.getItem('bottomLineTiming');
			if(timing != '暂停'){
				mainListTiming = setInterval( () => {
					setMainListFn(); //关键配件跟踪轮播事件
				}, parseInt(timing));
			}
			
		// },
		// error: err => {
		// 	if(err.readyState == 0){
		// 		$.showInforDlg('提示','网络异常，请检查网络！',2);
		// 	}else{
		// 		$.showInforDlg('提示','获取关键作业跟踪失败！',7);
		// 	}
		// 	console.log(err);
		// },
		// complete: () => {
			
		// }
	// })
}

function setMainListFn(){ //关键配件跟踪轮播事件-按高度
	let parentHeight = $('#mainList').parent()[0].clientHeight; //列表父节点的高
	let listHeight = $('#mainList')[0].clientHeight; //列表的高
	let listTop = $('#mainList')[0].offsetTop; //列表当前y轴位移
	let nextTop = listTop - parentHeight; //列表轮播后位移
	//列表高-列表y轴位移，小于等于父节点高 -> 最后一项了
	if(listHeight - Math.abs(listTop) <= parentHeight){
		getMinList(); //更新关键配件跟踪列表
		nextTop = 0; //列表轮播后位移
	}
	$('#mainList').css({ //下一组
		'top': nextTop + 'px',
	})
}

function getThisMonthReworkTable(){ //获取质量监控-当前月返工返修单列表
	let stuffCode = $('.photoActive').data('code'); //人员code
	let unitCode; //运用所code
	let deptCode; //质检组code
	for(let wapper of photoListData){
		for(let item of wapper.group){
			if(item.code == stuffCode){
				unitCode = item.unitCode;
				deptCode = item.deptCode
			}
		}
	}
	//获取当前日期
	let myDate = new Date();
	let nowY = myDate.getFullYear();
	let nowM = myDate.getMonth()+1;
	let endDate = nowY + "-" + (nowM < 10 ? "0" + nowM : nowM);//当前日期
	
	//获取三十天前日期
	let lw = new Date(myDate - 1000 * 60 * 60 * 24 * 30);
	let lastY = lw.getFullYear();
	let lastM = lw.getMonth()+1;
	let startDate = lastY + "-" + (lastM < 10 ? "0" + lastM : lastM);//三十天之前日期
	// $.ajax({
	// 	url: request_api + '/qualityManage/reWorkInfo',
	// 	data: {
	// 		unitCode: unitCode,
	// 		deptCode: deptCode,
	// 		stuffCode: stuffCode,
	// 		startDate: startDate,
	// 		endDate: endDate,
	// 	},
	// 	type: 'post',
	// 	dataType: 'json',
	// 	success: res => {
	// 		console.log(res);
	// 		let getData = res;
			let getData = [
				{
					"confirmReworkImageList":"",
					"dQCleaderSignTime":"",
					"dcreateTime":"2019/10/16 14:22:42",
					"endDate":"",
					"findReworkImageList":"",
					"iStatus":0,
					"iworkType":"测试类型二",
					"repairReworkImageList":"",
					"sDayplanId":"2019-10-16-00",
					"sFaultLevel":"A",
					"sFaultName":"测试",
					"sForeManCode":"",
					"sForeManName":"",
					"sForeManSignTime":"",
					"sProcessDeptCode":"0059500688",
					"sProcessDeptName":"检修一班",
					"sProcessResult":"",
					"sProcessStuffCode":"",
					"sProcessStuffName":"",
					"sProcessTime":"",
					"sQCleaderCode":"",
					"sQCleaderName":"",
					"sQcCode":"00595000930",
					"sQcDeptCode":"0059500686",
					"sQcDeptName":"质检组",
					"sQcName":"凌康",
					"sRemark":"",
					"sReworkId":"0df0129c746a4be3b035abe6d25995f1",
					"sRrrsummaryId":"f1ef767023ef4daca03629c56a6cc033",
					"sTrainSetName":"CRH380BL-3551",
					"sUnitCode":"029",
					"sUnitName":"南京南运用所",
					"startDate":""
				},
				{
					"confirmReworkImageList":"",
					"dQCleaderSignTime":"",
					"dcreateTime":"2019/10/16 14:22:42",
					"endDate":"",
					"findReworkImageList":"",
					"iStatus":0,
					"iworkType":"测试类型二",
					"repairReworkImageList":"",
					"sDayplanId":"2019-10-16-00",
					"sFaultLevel":"A",
					"sFaultName":"测试",
					"sForeManCode":"",
					"sForeManName":"",
					"sForeManSignTime":"",
					"sProcessDeptCode":"0059500688",
					"sProcessDeptName":"检修一班",
					"sProcessResult":"",
					"sProcessStuffCode":"",
					"sProcessStuffName":"",
					"sProcessTime":"",
					"sQCleaderCode":"",
					"sQCleaderName":"",
					"sQcCode":"00595000930",
					"sQcDeptCode":"0059500686",
					"sQcDeptName":"质检组",
					"sQcName":"凌康",
					"sRemark":"",
					"sReworkId":"0df0129c746a4be3b035abe6d25995f1",
					"sRrrsummaryId":"f1ef767023ef4daca03629c56a6cc033",
					"sTrainSetName":"CRH380BL-3551",
					"sUnitCode":"029",
					"sUnitName":"南京南运用所",
					"startDate":""
				},
				{
					"confirmReworkImageList":"",
					"dQCleaderSignTime":"",
					"dcreateTime":"2019/10/16 14:22:42",
					"endDate":"",
					"findReworkImageList":"",
					"iStatus":0,
					"iworkType":"测试类型二",
					"repairReworkImageList":"",
					"sDayplanId":"2019-10-16-00",
					"sFaultLevel":"A",
					"sFaultName":"测试",
					"sForeManCode":"",
					"sForeManName":"",
					"sForeManSignTime":"",
					"sProcessDeptCode":"0059500688",
					"sProcessDeptName":"检修一班",
					"sProcessResult":"",
					"sProcessStuffCode":"",
					"sProcessStuffName":"",
					"sProcessTime":"",
					"sQCleaderCode":"",
					"sQCleaderName":"",
					"sQcCode":"00595000930",
					"sQcDeptCode":"0059500686",
					"sQcDeptName":"质检组",
					"sQcName":"凌康",
					"sRemark":"",
					"sReworkId":"0df0129c746a4be3b035abe6d25995f1",
					"sRrrsummaryId":"f1ef767023ef4daca03629c56a6cc033",
					"sTrainSetName":"CRH380BL-3551",
					"sUnitCode":"029",
					"sUnitName":"南京南运用所",
					"startDate":""
				},
				{
					"confirmReworkImageList":"",
					"dQCleaderSignTime":"",
					"dcreateTime":"2019/10/16 14:22:42",
					"endDate":"",
					"findReworkImageList":"",
					"iStatus":0,
					"iworkType":"测试类型二",
					"repairReworkImageList":"",
					"sDayplanId":"2019-10-16-00",
					"sFaultLevel":"A",
					"sFaultName":"测试测试测试测试测试测试",
					"sForeManCode":"",
					"sForeManName":"",
					"sForeManSignTime":"",
					"sProcessDeptCode":"0059500688",
					"sProcessDeptName":"检修一班",
					"sProcessResult":"",
					"sProcessStuffCode":"",
					"sProcessStuffName":"",
					"sProcessTime":"",
					"sQCleaderCode":"",
					"sQCleaderName":"",
					"sQcCode":"00595000930",
					"sQcDeptCode":"0059500686",
					"sQcDeptName":"质检组",
					"sQcName":"凌康",
					"sRemark":"",
					"sReworkId":"0df0129c746a4be3b035abe6d25995f1",
					"sRrrsummaryId":"f1ef767023ef4daca03629c56a6cc033",
					"sTrainSetName":"CRH380BL-3551",
					"sUnitCode":"029",
					"sUnitName":"南京南运用所",
					"startDate":""
				}
			];
			
			//表格标题人名
			let reworkListName = '';
			let code = $('.photoActive').data('code');
			for(let wapper of photoListData){
				for(let item of wapper.group){
					if(item.code == code){
						reworkListName = item.name;
					}
				}
			}
			$('#reworkListName').text(reworkListName);

			let obj = '';
			for(let item of getData){
				//拆成日期，白夜班
				let sDayplanId = item.sDayplanId.slice(0,item.sDayplanId.length-3);
				let sDayplanId2 = item.sDayplanId.slice(item.sDayplanId.length-2,item.sDayplanId.length);
				sDayplanId2 = sDayplanId2 == '00' ? '白班' : '夜班';
				let status = item.sProcessResult.length == 0 ? '未整改' : '已整改';
				obj += '<li class="swiper-slide">';
				obj += '	<div><span>' + item.sTrainSetName + '</span></div>';
				obj += '	<div><span>' + sDayplanId + ' ' + sDayplanId2 + '</span></div>';
				obj += '	<div><span>' + status + '</span></div>';
				obj += '	<div><span>' + item.sProcessStuffName + '</span></div>';
				obj += '	<div><span>' + item.sFaultName + '</span></div>';
				obj += '</li>';
			}
			//如果存在轮播实例 - 先销毁->更新数据->重新加载swiper
			if(swiper_reworkTable != null){
				swiper_reworkTable.destroy(); //销毁
			}
			$('.check_botContent_tableEle').children().remove();
			$('.check_botContent_tableEle').append(obj);
			if(getData.length > 4){
				//添加轮播class
				$('.check_botContent_tableEleBox').addClass('swiper-container');
				$('.check_botContent_tableEleBox .check_botContent_tableEle').addClass('swiper-wrapper');
				//加载swiper
				swiper_reworkTable = new Swiper('.check_botContent_tableList .swiper-container', {
				    direction: 'vertical', //切换选项 垂直：vertical， 水平：horizontal
				    loop: true, //循环模式选项
				    autoplay: {
				    	delay: photoRelationTiming, //自动切换的时间间隔
				    	disableOnInteraction: false, //用户操作swiper之后，是否禁止autoplay。默认为true：停止。
				    },
				    grabCursor: true, //鼠标覆盖Swiper时指针会变成手掌形状，拖动时指针会变成抓手形状
				    slidesPerView: 4, //设置slider容器能够同时显示的slides数量
				    slidesPerGroup: 4, //定义slides的数量多少为一组
					spaceBetween: 0,
				    effect: 'slide', //切换效果，默认为"slide"（位移切换），可设置为'slide'（普通切换、默认）,"fade"（淡入）"cube"（方块）"coverflow"（3d流）"flip"（3d翻转）
				    loop: true, //设置为true 则开启loop模式。loop模式：会在原本slide前后复制若干个slide(默认一个)并在合适的时候切换，让Swiper看起来是循环的。 loop模式在与free模式同用时会产生抖动，因为free模式下没有复制slide的时间点
				    loopFillGroupWithBlank: true, //在loop模式下，为group填充空白slide
				    observer:true, //修改swiper自己或子元素时，自动初始化swiper 
					observeParents:false, //修改swiper的父元素时，自动初始化swiper 
				
				})
			}else{
				//不轮播-清除插件的class
				$('.check_botContent_tableEleBox').removeClass('swiper-container');
				$('.check_botContent_tableEleBox .check_botContent_tableEle').removeClass('swiper-wrapper');
				$('.check_botContent_tableEleBox .swiper-slide').removeClass('swiper-slide');
			}
	// 	},
	// 	error: err => {
	// 		if(err.readyState == 0){
	// 			$.showInforDlg('提示','网络异常，请检查网络！',2);
	// 		}else{
	// 			$.showInforDlg('提示','获取当前月返工返修单数量失败！',7);
	// 		}
	// 		console.log(err);
	// 	},
	// 	complete: () => {
			
	// 	}
	// })
}

function getQuality_unitStatistics(){ //获取质量鉴定运用所柱状图数据
	// let date = rework_fault_getDataTime(); //一个月时间
	// let strTime = date.startDate; //开始时间
	// let endTime = date.endDate; //结束时间
	// $.ajax({
	// 	url: request_api + '/AppraisalStatistics/getStatisticsBysUnitCodeDa',
	// 	data: {
	// 		strTime: strTime,
	// 		endTime: endTime,
	// 	},
	// 	type: 'post',
	// 	dataType: 'json',
	// 	success: res => {
	// 		console.log(res);
			
			setQuality_unitStatistics('res'); //设置质量鉴定运用所柱状图
	// 	},
	// 	error: err => {
	// 		if(err.readyState == 0){
	// 			$.showInforDlg('提示','网络异常，请检查网络！',2);
	// 		}else{
	// 			$.showInforDlg('提示','获取质量鉴定运用所柱状图失败！',7);
	// 		}
	// 		console.log(err);
	// 	},
	// 	complete: () => {
			
	// 	}
	// })
}
function setQuality_unitStatistics(getData){ //设置质量鉴定运用所柱状图
	let nameData = ['CRH1A','CRH1A','CRH1A','CRH1A','CRH1A'];
	let scoreData = [10,20,10,20,10];
	// let nameData = [];
	// let scoreData = [];
	// for(let item of getData.qualityidenFaults){
	// 	nameData.push(item.sUnitName.replace('动车组',''));
	// 	scoreData.push(item.count);
	// }
	echarts.init(document.getElementById('quality_unitStatisticsEle')).dispose(); //先销毁
	let ele = echarts.init(document.getElementById('quality_unitStatisticsEle'));
	let curInt;
	let option = {
		title:[
			{
				text: '单位（个）',
				textStyle:{
					fontSize: HTML_fontSize*0.75,
					// color: '#5e6081',
					color: '#fff',
				},
				right: 0,
				top: '3%',
			},
			{
				text: '- < 按运用所统计 > -',
				textStyle:{
					fontSize: HTML_fontSize*0.75,
					fontWeight: 700,
					color: '#4ea3ff'
				},
				x: 'center',
				top: '3%',
			}
		],
		tooltip: {
			trigger: 'axis',
			axisPointer: { // 坐标轴指示器，坐标轴触发有效
				type: 'shadow' ,// 默认为直线，可选为：'line' | 'shadow'
				shadowStyle:{
					color: 'rgba(255,255,255,0)'
				}
			}
		},
		grid: {
			left: '0',
			right: '5%',
			top: '25%',
			bottom: '5%',
			containLabel: true
		},
		xAxis: [ //x轴坐标xAxis的字体颜色大小，坐标线颜色，以及网格线的设置
			{
				type: 'category',
				data: nameData,
				axisTick: {
					alignWithLabel: true,
					show: false,
				},
				axisLine: {
					show: false,
					lineStyle: {
						type: 'solid',
						color: '#000', //坐标轴的颜色
						width: '1' //坐标线的宽度
					}
				},
				axisLabel: {
					textStyle: {
						// color: '#5e6081', //坐标值得具体的颜色
						color: '#fff',
						fontSize: HTML_fontSize*0.75,
						fontWeight: 200,
					},
					interval:0,
				}
			}
		],
		
		yAxis: [ //y轴坐标xAxis的字体颜色大小，坐标线颜色，以及网格线的设置
			{
				type: 'value',
				minInterval: 1,
				axisTick: {
					show: false,
				},
				axisLine: {
					show: false,
					lineStyle: {
						type: 'solid',
						// color: '#5e6081', //坐标轴的颜色
						color: '#fff',
						width: '1' //坐标线的宽度
					}
				},
				axisLabel: {
					textStyle: {
						color: '#fff',
						// color: '#5e6081', //坐标值得具体的颜色
						fontSize: '12',
					},
					interval:0,
				},
				splitLine: { //网格样式
					show: true,
					lineStyle: {
						color: ['#00284c'],
						width: 1,
						type: 'solid'
					},
				}
			}
		],
		series: [{
			//name: 'XXXXXXX',
			type: 'bar',
			barWidth: HTML_fontSize*1.25,
			data: scoreData,
			itemStyle:{
				normal:{
					color: '#22fce7',
					label: {
						show: true, //开启显示
						position: 'top', //在上方显示
						textStyle: { //数值样式
							color: '#22fce7',
							fontSize: HTML_fontSize*0.75
						},
					}
				}
			}
		}],
	};
	ele.setOption(option);
	
	ele.getZr().on('click', params => { //图形区域的点击事件
	// ele.on('click', function (params) {
		const pointlnPixel = [params.offsetX, params.offsetY]; //点击的坐标
		if(ele.containPixel('grid', pointlnPixel)){ //判断点击的坐标是否在图形区域
			curInt = ele.convertFromPixel({seriesIndex: 0}, pointlnPixel)[0]; //下标
		}else{
			return false;
		}
		
		if(getData.qualityidenFaults[curInt].count == 0){ //分数为0
			return false;
		}
		let date = rework_fault_getDataTime(); //一个月时间
		let detailData = {};
		detailData.sUnitCode = getData.qualityidenFaults[curInt].sUnitCode; //运用所code
		detailData.strTime = date.startDate; //开始时间
		detailData.endTime = date.endDate; //结束时间
		detailData.faultClassCode = ''; //故障
		detailData.sRepairStuffCode = ''; //人员code
		detailData.sTrainsetName = ''; //车组号
		detailData.sRepairStuffName = ''; //责任人
		let whichFn = '质量鉴定-运用所'; //判断是哪个详情
		getDetailPopData_quality(detailData, whichFn); //获取详情数据-detailData:参数 whichFn:判断是哪个详情
	});
	
}

function getRework_unitStatistics(){ //获取返工返修运用所柱状图数据
	let date = rework_fault_getDataTime(); //一个月时间
	let strTime = date.startDate; //开始时间
	let endTime = date.endDate; //结束时间
	// $.ajax({
	// 	url: request_api + '/ReworkRepair/getStatisticsBysUnitCode',
	// 	data: {
	// 		strTime: strTime,
	// 		endTime: endTime,
	// 	},
	// 	type: 'post',
	// 	dataType: 'json',
	// 	success: res => {
	// 		console.log(res);
			
			setRework_unitStatistics('res'); //设置返工返修运用所柱状图
	// 	},
	// 	error: err => {
	// 		if(err.readyState == 0){
	// 			$.showInforDlg('提示','网络异常，请检查网络！',2);
	// 		}else{
	// 			$.showInforDlg('提示','获取返工返修运用所柱状图失败！',7);
	// 		}
	// 		console.log(err);
	// 	},
	// 	complete: () => {
			
	// 	}
	// })
}
function setRework_unitStatistics(getData){ //设置返工返修运用所柱状图
	//柱状图的名字数组
	let nameData = ['检修一班','外协','检修一班','检修一班','检修一班','检修一班','检修一班'];
	let scoreData = [99,45,98,65,43,43,95]; //柱状图的分数数组
	// let nameData = [];
	// let scoreData = [];
	// for(let item of getData.zzReworkRecordList){
	// 	nameData.push(item.sUnitName.replace('动车组',''));
	// 	scoreData.push(item.count);
	// }
	let max = 1; //最大值数据 - 每50一个节点
	for(let score of scoreData){
		if(score > max){
			max = parseInt(score);
		}
	}
	let maxStr = (max / 50) + '';
	if(maxStr.indexOf('.') != -1){ //存在小数点
		maxStr = parseInt(maxStr.slice(0,maxStr.indexOf('.'))) + 1;
	}
	max = maxStr * 50;
	let maxData = [];
	for(let i=0; i<scoreData.length; i++){
		maxData.push(max);
	}
	echarts.init(document.getElementById('rework_unitStatisticsEle')).dispose(); //先销毁
	let ele = echarts.init(document.getElementById('rework_unitStatisticsEle'));
	let curInt;
	let option = {
		title:[
			{
				text: '单位（个）',
				textStyle:{
					fontSize: HTML_fontSize*0.75,
					// color: '#5e6081',
					color: '#fff',
				},
				right: 0,
				top: '3%',
			},
			{
				text: '- < 按运用所统计 > -',
				textStyle:{
					fontSize: HTML_fontSize*0.75,
					fontWeight: 700,
					color: '#4ea3ff'
				},
				x: 'center',
				top: '3%',
			}
		],
		tooltip: {
			trigger: 'axis',
			axisPointer: { // 坐标轴指示器，坐标轴触发有效
				type: 'shadow' ,// 默认为直线，可选为：'line' | 'shadow'
				shadowStyle:{
					color: 'rgba(255,255,255,0)'
				}
			},
			formatter: function(params){ //鼠标覆盖不展示背景柱子的数据
				// console.log(params[1]);
				return params[1].name + '<br><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:#ffde38"></span> ' + params[1].data
			}
		},
		grid: {
			left: '0',
			right: '8%',
			top: '18%',
			bottom: '1%',
			containLabel: true
		},
		yAxis: [ //x轴坐标xAxis的字体颜色大小，坐标线颜色，以及网格线的设置
			{
				type: 'category',
				data: nameData,
				axisTick: {
					alignWithLabel: true,
					show: false,
				},
				axisLine: {
					show: false,
					lineStyle: {
						type: 'solid',
						color: '#ebebeb', //坐标轴的颜色
						width: '2' //坐标线的宽度
					}
				},
				axisLabel: {
					interval: 0,
					textStyle: {
						// color: '#5e6081', //坐标值得具体的颜色
						color: '#fff',
						fontSize: HTML_fontSize*0.75,
					}
				}
			}
		],
		
		xAxis: [ //y轴坐标xAxis的字体颜色大小，坐标线颜色，以及网格线的设置
			{
				type: 'value',
				axisTick: {
					show: false,
				},
				axisLine: {
					show: false,
					lineStyle: {
						type: 'solid',
						color: '#ebebeb', //坐标轴的颜色
						width: '2' //坐标线的宽度
					}
				},
				axisLabel: {
					show: false,
					textStyle: {
						color: '#666666', //坐标值得具体的颜色
						fontSize: '15',
					}
				},
				splitLine: { //网格样式
					show: false,
					lineStyle: {
						color: ['#ebebeb'],
						width: 2,
						type: 'solid'
					}
				}
			}
		],
		series: [
			{ // For shadow
	            type: 'bar',
				barWidth: HTML_fontSize*0.312,
	            itemStyle: {
	                normal: {
						color: '#5e6081',
						barBorderRadius: 5,
						label: {
							show: true, //开启显示
							position: 'right', //在上方显示
							textStyle: { //数值样式
								color: '#ffde38',
								fontSize: HTML_fontSize*0.75
							},
							formatter: function(data){ //显示高亮色柱的值
								return scoreData[data.dataIndex];
							}
						}
					},
					
	            },
	            barGap:'-100%',
	            barCategoryGap:'40%',
	            data: maxData,
	            animation: false,
	        },
			{
				//name: 'XXXXXXX',
				type: 'bar',
				barWidth: HTML_fontSize*0.312,
				data: scoreData,
				itemStyle:{
					normal:{
						barBorderRadius: 5,
						color: '#ffde38',
					}
				}
			}
		],
	};
	
	ele.setOption(option);
	
	ele.getZr().on('click', params => { //图形区域的点击事件
	// ele.on('click', function (params) {
		const pointlnPixel = [params.offsetX, params.offsetY]; //点击的坐标
		if(ele.containPixel('grid', pointlnPixel)){ //判断点击的坐标是否在图形区域
			curInt = ele.convertFromPixel({seriesIndex: 0}, pointlnPixel)[1]; //下标
		}else{
			return false;
		}
		
		if(getData.zzReworkRecordList[curInt].count == 0){ //分数为0
			return false;
		}
		let date = rework_fault_getDataTime(); //一个月时间
		let detailData = {};
		detailData.sUnitCode = getData.zzReworkRecordList[curInt].sUnitCode; //运用所code
		detailData.iworkType = '';
		detailData.sQcCode = '';
		detailData.sProcessStuffCode = '';
		detailData.sProcessDeptCode = '';
		detailData.strHours = 0;
		detailData.endHours = 0;
		detailData.strTime = date.startDate; //开始时间
		detailData.endTime = date.endDate; //结束时间
		detailData.faultClassCode = ''; //故障
		detailData.sRepairStuffCode = ''; //人员code
		detailData.sTrainsetName = ''; //车组号
		detailData.sRepairStuffName = ''; //责任人
		let whichFn = '返工返修-运用所'; //判断是哪个详情
		getDetailPopData(detailData, whichFn); //获取详情数据-detailData:参数 whichFn:判断是哪个详情
	});
	
}

function getQuality_faultStatistics(){ //获取质量鉴定故障环状图数据
	let date = rework_fault_getDataTime(); //一个月时间
	let dataList = {};
	//如果配置选的是段，那么传第一个所code
	if($('#menu_select option:selected').data('unitvalue') == 0){
		$('#menu_select option').each( (i,e) => {
			if($(e).data('unitvalue') != 0){ //等于0的是段选项
				dataList.sUnitCode = $(e).val();
				return false; //得到第一个不是段选项的选项，就返回
			}
		});
	}else{
		dataList.sUnitCode = $('#menu_select').val();
	}
	dataList.sTrainsetName = ''; //车组号
	dataList.faultClassCode = '';
	dataList.sRepairStuffName = '';
	dataList.strTime = date.startDate; //开始时间
	dataList.endTime = date.endDate; //结束时间
	dataList = JSON.stringify(dataList);
	// $.ajax({
	// 	url: request_api + '/AppraisalStatistics/getStatisticsByfaultClassCode',
	// 	data: {
	// 		dataList: dataList,
	// 	},
	// 	type: 'post',
	// 	dataType: 'json',
	// 	success: res => {
	// 		console.log(res);
			
			setQuality_faultStatistics('res'); //设置质量鉴定故障环状图
	// 	},
	// 	error: err => {
	// 		if(err.readyState == 0){
	// 			$.showInforDlg('提示','网络异常，请检查网络！',2);
	// 		}else{
	// 			$.showInforDlg('提示','获取质量鉴定故障环状图失败！',7);
	// 		}
	// 		console.log(err);
	// 	},
	// 	complete: () => {
			
	// 	}
	// })
}
function setQuality_faultStatistics(getData){ //设置质量鉴定故障环状图
	// let dataList = [];
	// let nameList = [];
	// let allScore = 0;
	// for(let item of getData.qcMQualityidenFaults){
	// 	allScore += parseInt(item.count);
	// }
	// //占比小于5%的数据，合在一起展示'其他'
	// let other = {}; //'其他'数据
	// other.name = '其他';
	// other.value = 0;
	// other.code = []; //'其他'的code-最后转','拼接
	// for(let item of getData.qcMQualityidenFaults){
	// 	let thisVal = parseInt(item.count); //数量
	// 	if(thisVal / allScore <= 0.05){ //占比不大于5%的数据-value加进other
	// 		other.value += thisVal;
	// 		other.code.push(item.faultclasscode);
	// 	}else{
	// 		let obj = {};
	// 		obj.name = item.faultclassname;
	// 		obj.value = item.count;
	// 		obj.code = item.faultclasscode;
	// 		dataList.push(obj);
	// 		nameList.push(item.faultclassname);
	// 	}
	// }
	// if(other.value > 0){ //存在占比不大于5%的数据
	// 	//将占比不大于5%的数据的code转字符串
	// 	other.code = other.code.join(',');
		
	// 	dataList.push(other); //将'其他'的数据push进环状图数据
	// 	nameList.push(other.name); //类型列表-图例
	// }

	let dataList = [
		{name: '答题准确率', value: 30},
		{name: '派工单完成率派工单完成率', value: 30},
		{name: '平均得分', value: 20},
		{name: '临修确认率', value: 10},
		{name: '效率评价', value: 10},
		{name: 'aaaaaa', value: 20},
	];
	let nameList = ['答题准确率','派工单完成率派工单完成率','平均得分','临修确认率','效率评价','aaaaaa'];
	let allScore = 0;
	for(let item of dataList){
		allScore += item.value;
	}
	
	let colorList = ['#5770c7','#ec9231','#e64e48','#3fa4e4','#f1a555','#ea7e2f','#3f7dec','#f9de5c','#ed181f','#345be9','#f0e91f','#0d8700','#007987','#e8da45','#ec6cc0','#0087bf','#b7dd1e','#e426a3','#2375bb','#8ad80f','#7af8e6','#7851e6','#68d676','#18e1c4','#a236d4','#61b803','#5a2db2','#eb6c70','#90fc1c','#a275fa',];
	//图表标题显示运用所name（传的哪个code就显示哪个name）
	let unitName = $('#menu_select option:selected').text();;
	if($('#menu_select option:selected').data('unitvalue') == 0){
		$('#menu_select option').each( (i,e) => {
			if($(e).data('unitvalue') != 0){ //等于0的是段选项
				unitName = $(e).text();
				return false; //得到第一个不是段选项的选项，就返回
			}
		});
	}
	echarts.init(document.getElementById('quality_faultStatisticsEle')).dispose(); //先销毁
	let ele = echarts.init(document.getElementById('quality_faultStatisticsEle'));
	let curInt;
	let option = {
		title:[
			{
				text: '单位（个）',
				textStyle:{
					fontSize: HTML_fontSize*0.75,
					// color: '#5e6081',
					color: '#fff',
				},
				right: 0,
				top: '3%',
			},
			{
				text: '- < ' + unitName + ' 故障类型 > -',
				textStyle:{
					fontSize: HTML_fontSize*0.75,
					fontWeight: 700,
					color: '#4ea3ff'
				},
				x: 'center',
				top: '3%',
			}
		],
		color: colorList,
		tooltip: {
			trigger: 'item',
			position: 'right',
			formatter: data => {
				// console.log(data);
				let obj = data.marker + data.seriesName + "<br>" + data.name + '：' + data.value + " (" + Math.round(data.percent) + '%)';
				return obj;
			}
		},
		legend: {
			type: 'scroll',
			orient: 'vertical',
			icon:"rect",
			itemWidth: HTML_fontSize*0.625,
			itemHeight: HTML_fontSize*0.625,
			// icon:"image:///static/img/close_in.png",
			show: false,
			right: 0,
			top: '15%',
			bottom: '5%',
			itemGap: 2, //每项间隔
			selectedMode: true, //图例点击事件
			textStyle: {
				fontSize: HTML_fontSize*0.75,
				// color: '#5e6081',
				color: '#fff',
			},
			formatter: function(name){
				//加数值
				var thisValue; //当前value
				for(var item of dataList){
					if (item.name == name) {
						thisValue = item.value;
					}
				}
				// var p = (thisValue / allScore * 100).toFixed(2);
				
				//截取字节数
				let len = 16; //最大字节数
				for (let i = Math.floor(len / 2); i < name.length; i++){
					if (name.substr(0, i).replace(/[^\x00-\xff]/g, '01').length >= len){ //将一个文字换成两个数字
						return name.substr(0, Math.floor(i / 2) * 2) + '...';
					}
				}
				return name + '  ' + thisValue;
			},
			data: nameList,
		},
		series: [{
			itemStyle:{
				// normal: {
				// 	borderWidth: 3, 
				// 	borderColor: '#fff',
				// }
			},
			name:'详细',
			type:'pie',
			center: ['28%', '57%'],
			radius: ['48%', '60%'],
			avoidLabelOverlap: false,
			label: {
				normal: {
					show: true,
					// position: 'center',
					textStyle: {
						fontSize: HTML_fontSize*0.75,
					},
					formatter: data => {
//								console.log(data);
						return Math.round(data.percent) + "%";
					}
				},
				emphasis: {
					show: false, //鼠标覆盖环状中间显示
					textStyle: {
						fontSize: '30',
						fontWeight: 'bold'
					}
				},
			},
			labelLine: {
				normal: {
					show: true,
					length: 4
				}
			},
			data: dataList
		 }],
		// graphic:{       //图形中间文字
	 //        type:"text",
	 //        left:"center",
	 //        top:"center",
	 //        style:{
	 //            text: allScore, // + "\n故障总数",
	 //            textAlign:"center",
	 //            fill:"#000",
	 //            fontSize: 50,
	 //            fontWeight: 900
	 //        }
	 //    },
	};
	ele.setOption(option);
	ele.on('click', function (params) {
		let date = rework_fault_getDataTime(); //一个月时间
		curInt = params.dataIndex; //下标
		let detailData = {};
		detailData.faultClassCode = dataList[curInt].code + ','; //故障code
		//如果配置选的是段，那么传第一个所code
		if($('#menu_select option:selected').data('unitvalue') == 0){
			$('#menu_select option').each( (i,e) => {
				if($(e).data('unitvalue') != 0){ //等于0的是段选项
					detailData.sUnitCode = $(e).val();
					return false; //得到第一个不是段选项的选项，就返回
				}
			});
		}else{
			detailData.sUnitCode = $('#menu_select').val(); //运用所code 
		}
		detailData.strTime = date.startDate; //开始时间
		detailData.endTime = date.endDate; //结束时间
		detailData.sRepairStuffCode = ''; //人员code
		detailData.sTrainsetName = ''; //车组号
		detailData.sRepairStuffName = ''; //责任人
		let whichFn = '质量鉴定-故障';
		getDetailPopData_quality(detailData, whichFn); //获取详情数据(质量鉴定)-detailData:参数 whichFn:判断是哪个详情
	});
	//故障总数
	$('.quality_faultStatisticsBox .allScore').text(allScore);
	//轮播图例
	let legendEle = '';
	let swiper_wrapper = '';
	let swiper_slide = '';
	if(dataList.length > 3){ //大于三个才加轮播属性
		swiper_wrapper = 'swiper-wrapper';
		swiper_slide = 'swiper-slide';
	}
	legendEle += '<ul class="' + swiper_wrapper + '">';
	for(let j=0; j<dataList.length; j++){
		let color = colorList[j];
		let score = dataList[j].value;
		let name = dataList[j].name;
		let len = 12; //最大字节数
		name = interceptingByte(name, len); //截取字节-参数：截取的字符串，截取的字符数
		legendEle += '<li class="' + swiper_slide + '">';
		legendEle += '	<span class="faultStatistics_legend_icon" style="background-color: ' + color + ';"></span>';
		legendEle += '	<p class="faultStatistics_legend_name">' + name + '</p>';
		legendEle += '	<span class="faultStatistics_legend_score" style="color: ' + color + ';">' + score + '</span>';
		legendEle += '</li>';
	}
	legendEle += '</ul>';
	
	//如果存在轮播实例 - 先销毁->更新数据->重新加载swiper
	if(swiper_qualityLegend != null){
		swiper_qualityLegend.destroy(); //销毁
	}
	$('.quality_faultStatisticsBox .faultStatistics_legendBox').children().remove();
	$('.quality_faultStatisticsBox .faultStatistics_legendBox').append(legendEle);
	
	if(dataList.length > 3){ //大于三个才轮播
		//加载swiper
		let autoplay = false;
		let timing = localStorage.getItem('bottomLineTiming');
		if(timing != '暂停'){
			autoplay = {
				delay: parseInt(timing), //自动切换的时间间隔
				disableOnInteraction: false, //用户操作swiper之后，是否禁止autoplay。默认为true：停止。
			}
		}
		swiper_qualityLegend = new Swiper('.quality_faultStatisticsBox .swiper-container', {
			direction: 'vertical', //切换选项 垂直：vertical， 水平：horizontal
			loop: true, //循环模式选项
			autoplay: autoplay,
			grabCursor: true, //鼠标覆盖Swiper时指针会变成手掌形状，拖动时指针会变成抓手形状
			slidesPerView: 3, //设置slider容器能够同时显示的slides数量
			slidesPerGroup: 3, //定义slides的数量多少为一组
			spaceBetween: 0,
			effect: 'slide', //切换效果，默认为"slide"（位移切换），可设置为'slide'（普通切换、默认）,"fade"（淡入）"cube"（方块）"coverflow"（3d流）"flip"（3d翻转）
			loop: true, //设置为true 则开启loop模式。loop模式：会在原本slide前后复制若干个slide(默认一个)并在合适的时候切换，让Swiper看起来是循环的。 loop模式在与free模式同用时会产生抖动，因为free模式下没有复制slide的时间点
			loopFillGroupWithBlank: true, //在loop模式下，为group填充空白slide
			observer:true, //修改swiper自己或子元素时，自动初始化swiper 
			observeParents:false, //修改swiper的父元素时，自动初始化swiper 
		
		})
	}
}
function rework_fault_getDataTime(){ //一个月时间
	//获取当前日期
	let myDate = new Date();
	let nowY = myDate.getFullYear();
	let nowM = myDate.getMonth()+1;
	let nowD = myDate.getDate();
	let endDate = nowY + "-" + (nowM < 10 ? "0" + nowM : nowM) + "-" + (nowD < 10 ? "0" + nowD : nowD);//当前日期
	
	//获取三十天前日期
	let lw = new Date(myDate - 1000 * 60 * 60 * 24 * 30);
	let lastY = lw.getFullYear();
	let lastM = lw.getMonth()+1;
	let lastD = lw.getDate();
	let startDate = lastY + "-" + (lastM < 10 ? "0" + lastM : lastM) + "-" + (lastD < 10 ? "0" + lastD : lastD);//三十天之前日期
	
	let date = {
		startDate: startDate,
		endDate: endDate,
	};
	return date;
}

function getRework_faultStatistics(){ //获取返工返修故障环状图数据
	let date = rework_fault_getDataTime(); //一个月时间
	let dataList = {};
	//如果配置选的是段，那么传第一个所code
	if($('#menu_select option:selected').data('unitvalue') == 0){
		$('#menu_select option').each( (i,e) => {
			if($(e).data('unitvalue') != 0){ //等于0的是段选项
				dataList.sUnitCode = $(e).val();
				return false; //得到第一个不是段选项的选项，就返回
			}
		});
	}else{
		dataList.sUnitCode = $('#menu_select').val();
	}
	dataList.sTrainsetName = ''; //车组号
	dataList.strTime = date.startDate; //开始时间
	dataList.endTime = date.endDate; //结束时间
	dataList = JSON.stringify(dataList);
	// $.ajax({
	// 	url: request_api + '/ReworkRepair/SystemFailure',
	// 	data: {
	// 		dataList: dataList,
	// 	},
	// 	type: 'post',
	// 	dataType: 'json',
	// 	success: res => {
	// 		console.log(res);
			
			setRework_faultStatistics('res'); //设置返工返修故障环状图
	// 	},
	// 	error: err => {
	// 		if(err.readyState == 0){
	// 			$.showInforDlg('提示','网络异常，请检查网络！',2);
	// 		}else{
	// 			$.showInforDlg('提示','获取返工返修故障环状图失败！',7);
	// 		}
	// 		console.log(err);
	// 	},
	// 	complete: () => {
			
	// 	}
	// })
}
function setRework_faultStatistics(getData){ //设置返工返修故障环状图
	// let dataList = [];
	// let nameList = [];
	// let allScore = 0;
	// for(let item of getData.zzReworkRecords){
	// 	allScore += parseInt(item.count);
	// }
	// //占比小于5%的数据，合在一起展示'其他'
	// let other = {}; //'其他'数据
	// other.name = '其他';
	// other.value = 0;
	// other.code = []; //'其他'的code-最后转','拼接
	// for(let item of getData.zzReworkRecords){
	// 	let thisVal = parseInt(item.count); //数量
	// 	if(thisVal / allScore <= 0.05){ //占比不大于5%的数据-value加进other
	// 		other.value += thisVal;
	// 		other.code.push(item.iworkType);
	// 	}else{
	// 		let obj = {};
	// 		obj.name = item.iworkType;
	// 		obj.code = item.iworkType;
	// 		obj.value = item.count;
	// 		dataList.push(obj);
	// 		nameList.push(item.iworkType);
	// 	}
	// }
	// if(other.value > 0){ //存在占比不大于5%的数据
	// 	//将占比不大于5%的数据的code转字符串
	// 	other.code = other.code.join(',');
		
	// 	dataList.push(other); //将'其他'的数据push进环状图数据
	// 	nameList.push(other.name); //类型列表-图例
	// }
	
	let dataList = [
		{name: '答题准确率', value: 30},
		{name: '派工单完成率派工单完成率', value: 30},
		{name: '平均得分', value: 20},
		{name: '临修确认率', value: 10},
		{name: '效率评价', value: 10},
		{name: 'aaaaaa', value: 20},
	];
	let nameList = ['答题准确率','派工单完成率派工单完成率','平均得分','临修确认率','效率评价','aaaaaa'];
	let allScore = 0;
	for(let item of dataList){
		allScore += item.value;
	}
	
	let colorList = ['#5770c7','#ec9231','#e64e48','#3fa4e4','#f1a555','#ea7e2f','#3f7dec','#f9de5c','#ed181f','#345be9','#f0e91f','#0d8700','#007987','#e8da45','#ec6cc0','#0087bf','#b7dd1e','#e426a3','#2375bb','#8ad80f','#7af8e6','#7851e6','#68d676','#18e1c4','#a236d4','#61b803','#5a2db2','#eb6c70','#90fc1c','#a275fa',];
	
	//图表标题显示运用所name（传的哪个code就显示哪个name）
	let unitName = $('#menu_select option:selected').text();;
	if($('#menu_select option:selected').data('unitvalue') == 0){
		$('#menu_select option').each( (i,e) => {
			if($(e).data('unitvalue') != 0){ //等于0的是段选项
				unitName = $(e).text();
				return false; //得到第一个不是段选项的选项，就返回
			}
		});
	}
	echarts.init(document.getElementById('rework_faultStatisticsEle')).dispose(); //先销毁
	let ele = echarts.init(document.getElementById('rework_faultStatisticsEle'));
	let curInt;
	let option = {
		title:[
			{
				text: '单位（个）',
				textStyle:{
					fontSize: HTML_fontSize*0.75,
					// color: '#5e6081',
					color: '#fff',
				},
				right: 0,
				top: '3%',
			},
			{
				text: '- < ' + unitName + ' 系统故障分析 > -',
				textStyle:{
					fontSize: HTML_fontSize*0.75,
					fontWeight: 700,
					color: '#4ea3ff'
				},
				x: 'center',
				top: '3%',
			}
		],
		color: colorList,
		tooltip: {
			trigger: 'item',
			position: 'right',
			formatter: data => {
				// console.log(data);
				let obj = data.marker + data.seriesName + "<br>" + data.name + '：' + data.value + " (" + Math.round(data.percent) + '%)';
				return obj;
			}
		},
		legend: {
			type: 'scroll',
			orient: 'vertical',
			icon:"rect",
			itemWidth: HTML_fontSize*0.625,
			itemHeight: HTML_fontSize*0.625,
			// icon:"image:///static/img/close_in.png",
			show: false,
			right: 0,
			top: '15%',
			bottom: '5%',
			itemGap: 2, //每项间隔
			selectedMode: true, //图例点击事件
			textStyle: {
				fontSize: HTML_fontSize*0.75,
				// color: '#5e6081',
				color: '#fff',
			},
			formatter: function(name){
				//加数值
				var thisValue; //当前value
				for(var item of dataList){
					if (item.name == name) {
						thisValue = item.value;
					}
				}
				// var p = (thisValue / allScore * 100).toFixed(2);
				
				//截取字节数
				let len = 16; //最大字节数
				for (let i = Math.floor(len / 2); i < name.length; i++){
					if (name.substr(0, i).replace(/[^\x00-\xff]/g, '01').length >= len){ //将一个文字换成两个数字
						return name.substr(0, Math.floor(i / 2) * 2) + '...';
					}
				}
				return name + '  ' + thisValue;
			},
			data: nameList,
		},
		series: [{
			itemStyle:{
				// normal: {
				// 	borderWidth: 3, 
				// 	borderColor: '#fff',
				// }
			},
			name:'详细',
			type:'pie',
			center: ['28%', '57%'],
			radius: ['48%', '60%'],
			avoidLabelOverlap: false,
			label: {
				normal: {
					show: true,
					// position: 'center',
					textStyle: {
						fontSize: HTML_fontSize*0.75,
					},
					formatter: data => {
//								console.log(data);
						return Math.round(data.percent) + "%";
					}
				},
				emphasis: {
					show: false, //鼠标覆盖环状中间显示
					textStyle: {
						fontSize: '30',
						fontWeight: 'bold'
					}
				},
			},
			labelLine: {
				normal: {
					show: true,
					length: 4
				}
			},
			data: dataList
		 }],
		// graphic:{       //图形中间文字
	 //        type:"text",
	 //        left:"center",
	 //        top:"center",
	 //        style:{
	 //            text: allScore, // + "\n故障总数",
	 //            textAlign:"center",
	 //            fill:"#000",
	 //            fontSize: 50,
	 //            fontWeight: 900
	 //        }
	 //    },
	};
	ele.setOption(option);
	
	ele.on('click', function (params) {
		let date = rework_fault_getDataTime(); //一个月时间
		curInt = params.dataIndex; //下标
		let detailData = {};
		//如果配置选的是段，那么传第一个所code
		if($('#menu_select option:selected').data('unitvalue') == 0){
			$('#menu_select option').each( (i,e) => {
				if($(e).data('unitvalue') != 0){ //等于0的是段选项
					detailData.sUnitCode = $(e).val();
					return false; //得到第一个不是段选项的选项，就返回
				}
			});
		}else{
			detailData.sUnitCode = $('#menu_select').val(); //运用所code 
		}
		detailData.sTrainsetName = ''; //车组号
		detailData.iworkType = dataList[curInt].code + ','; //故障名
		detailData.sQcCode = ''; //质检员id
		detailData.sProcessStuffCode = ''; //作业人员id
		detailData.sProcessDeptCode = ''; //班组id
		detailData.strHours = 0; //开始小时
		detailData.endHours = 0; //结束小时
		detailData.strTime = date.startDate; //开始时间
		detailData.endTime = date.endDate; //结束时间
		let whichFn = '返工返修-故障';
		getDetailPopData(detailData, whichFn); //获取详情数据-detailData:参数 whichFn:判断是哪个详情
	});
	
	//故障总数
	$('.rework_faultStatisticsBox .allScore').text(allScore);
	//轮播图例
	let legendEle = '';
	let swiper_wrapper = '';
	let swiper_slide = '';
	if(dataList.length > 3){ //大于三个才加轮播属性
		swiper_wrapper = 'swiper-wrapper';
		swiper_slide = 'swiper-slide';
	}
	legendEle += '<ul class="' + swiper_wrapper + '">';
	for(let j=0; j<dataList.length; j++){
		let color = colorList[j];
		let score = dataList[j].value;
		let name = dataList[j].name;
		let len = 12; //最大字节数
		name = interceptingByte(name, len); //截取字节-参数：截取的字符串，截取的字符数
		legendEle += '<li class="' + swiper_slide + '">';
		legendEle += '	<span class="faultStatistics_legend_icon" style="background-color: ' + color + ';"></span>';
		legendEle += '	<p class="faultStatistics_legend_name">' + name + '</p>';
		legendEle += '	<span class="faultStatistics_legend_score" style="color: ' + color + ';">' + score + '</span>';
		legendEle += '</li>';
	}
	legendEle += '</ul>';
	
	//如果存在轮播实例 - 先销毁->更新数据->重新加载swiper
	if(swiper_reworkLegend != null){
		swiper_reworkLegend.destroy(); //销毁
	}
	$('.rework_faultStatisticsBox .faultStatistics_legendBox').children().remove();
	$('.rework_faultStatisticsBox .faultStatistics_legendBox').append(legendEle);
	
	if(dataList.length > 3){ //大于三个才轮播
		//加载swiper
		let autoplay = false;
		let timing = localStorage.getItem('bottomLineTiming');
		if(timing != '暂停'){
			autoplay = {
				delay: parseInt(timing), //自动切换的时间间隔
				disableOnInteraction: false, //用户操作swiper之后，是否禁止autoplay。默认为true：停止。
			}
		}
		swiper_reworkLegend = new Swiper('.rework_faultStatisticsBox .swiper-container', {
			direction: 'vertical', //切换选项 垂直：vertical， 水平：horizontal
			loop: true, //循环模式选项
			autoplay: autoplay,
			grabCursor: true, //鼠标覆盖Swiper时指针会变成手掌形状，拖动时指针会变成抓手形状
			slidesPerView: 3, //设置slider容器能够同时显示的slides数量
			slidesPerGroup: 3, //定义slides的数量多少为一组
			spaceBetween: 0,
			effect: 'slide', //切换效果，默认为"slide"（位移切换），可设置为'slide'（普通切换、默认）,"fade"（淡入）"cube"（方块）"coverflow"（3d流）"flip"（3d翻转）
			loop: true, //设置为true 则开启loop模式。loop模式：会在原本slide前后复制若干个slide(默认一个)并在合适的时候切换，让Swiper看起来是循环的。 loop模式在与free模式同用时会产生抖动，因为free模式下没有复制slide的时间点
			loopFillGroupWithBlank: true, //在loop模式下，为group填充空白slide
			observer:true, //修改swiper自己或子元素时，自动初始化swiper 
			observeParents:false, //修改swiper的父元素时，自动初始化swiper 
		})
	}
}

function getComm_botEchart(){ //获取质量评价-bottom折线图数据
	//获取当前日期毫秒值
	let myDate = new Date();
	let thisDateTime = myDate.getTime();
	// $.ajax({
	// 	url: request_api + '/qualityManage/getDeptScoreToYear',
	// 	data: {
	// 		thisTime: thisDateTime
	// 	},
	// 	type: 'post',
	// 	dataType: 'json',
	// 	success: res => {
	// 		console.log(res);
	// 		let getData = res;
			let getData = [
				{
					"deptScores":[
						{
							"date":"2019-10",
							"score":"50"
						},
						{
							"date":"2019-09",
							"score":"20"
						},
						{
							"date":"2019-08",
							"score":"70"
						},
						{
							"date":"2019-07",
							"score":"40"
						},
						{
							"date":"2019-06",
							"score":"30"
						},
						{
							"date":"2019-05",
							"score":"90"
						},
						{
							"date":"2019-04",
							"score":"70"
						},
						{
							"date":"2019-03",
							"score":"10"
						},
						{
							"date":"2019-02",
							"score":"30"
						},
						{
							"date":"2019-01",
							"score":"20"
						},
						{
							"date":"2018-12",
							"score":"40"
						},
						{
							"date":"2018-11",
							"score":"20"
						}
					],
					"unitCode":"024",
					"unitName":"南京动车组运用所"
				},
				{
					"deptScores":[
						{
							"date":"2018-10",
							"score":"10"
						},
						{
							"date":"2018-09",
							"score":"90"
						},
						{
							"date":"2018-08",
							"score":"20"
						},
						{
							"date":"2018-07",
							"score":"80"
						},
						{
							"date":"2018-06",
							"score":"30"
						},
						{
							"date":"2018-05",
							"score":"70"
						},
						{
							"date":"2018-04",
							"score":"40"
						},
						{
							"date":"2018-03",
							"score":"60"
						},
						{
							"date":"2018-02",
							"score":"50"
						},
						{
							"date":"2018-01",
							"score":"50"
						},
						{
							"date":"2017-12",
							"score":"80"
						},
						{
							"date":"2017-11",
							"score":"40"
						}
					],
					"unitCode":"029",
					"unitName":"南京南动车组运用所"
				},
				{
					"deptScores":[
						{
							"date":"2017-10",
							"score":"30"
						},
						{
							"date":"2017-09",
							"score":"10"
						},
						{
							"date":"2017-08",
							"score":"20"
						},
						{
							"date":"2017-07",
							"score":"60"
						},
						{
							"date":"2017-06",
							"score":"40"
						},
						{
							"date":"2017-05",
							"score":"50"
						},
						{
							"date":"2017-04",
							"score":"90"
						},
						{
							"date":"2017-03",
							"score":"70"
						},
						{
							"date":"2017-02",
							"score":"80"
						},
						{
							"date":"2017-01",
							"score":"10"
						},
						{
							"date":"2016-12",
							"score":"20"
						},
						{
							"date":"2016-11",
							"score":"30"
						}
					],
					"unitCode":"044",
					"unitName":"合肥南动车组运用所"
				},
				{
					"deptScores":[
						{
							"date":"2016-10",
							"score":"10"
						},
						{
							"date":"2016-09",
							"score":"90"
						},
						{
							"date":"2016-08",
							"score":"30"
						},
						{
							"date":"2016-07",
							"score":"40"
						},
						{
							"date":"2016-06",
							"score":"80"
						},
						{
							"date":"2016-05",
							"score":"30"
						},
						{
							"date":"2016-04",
							"score":"70"
						},
						{
							"date":"2016-03",
							"score":"40"
						},
						{
							"date":"2016-02",
							"score":"90"
						},
						{
							"date":"2016-01",
							"score":"70"
						},
						{
							"date":"2015-12",
							"score":"40"
						},
						{
							"date":"2015-11",
							"score":"80"
						}
					],
					"unitCode":"058",
					"unitName":"徐州东动车组运用所"
				}
			];
			
			setComm_botEchart(getData); //设置质量评价-bottom折线图
	// 	},
	// 	error: err => {
	// 		if(err.readyState == 0){
	// 			$.showInforDlg('提示','网络异常，请检查网络！',2);
	// 		}else{
	// 			$.showInforDlg('提示','获取质量评价折线图失败！',7);
	// 		}
	// 		console.log(err);
	// 	},
	// 	complete: () => {
			
	// 	}
	// })
}
function setComm_botEchart(getData){ //设置质量评价-bottom折线图
	let colorList = ['#ff616c', '#ffde38', '#12db6a', '#22fce7']; //色值
	let nameList = []; //图例名称数组
	let scoreData = []; //数据数组
	for(let i=0; i<getData.length; i++){
		let item = getData[i];
		item.unitName = item.unitName.replace('动车组','');
		nameList.push(item.unitName); //图例名称数组
		
		let obj = {
			name: item.unitName, //名称
			type: 'line',
			itemStyle:{
				normal:{
					color: colorList[i], //色值
				},
			},
			data: [], //分数
		}
		for(let j=item.deptScores.length-1; j>=0; j--){
			obj.data.push(item.deptScores[j].score);
		}
		scoreData.push(obj);
	}
	
	let nameData = []; //X轴名称数组
	for(let i=getData[0].deptScores.length-1; i>=0; i--){
		nameData.push(getData[0].deptScores[i].date);
	}
	// let scoreData = [
	// 	{
	// 		name: '南京运用所',
	// 		type: 'line',
	// 		data: [10,30,20,40,50,12,54,32,100,1,34,65],
	// 		// smooth: true,
	// 		itemStyle:{
	// 			normal:{
	// 				color: '#ff616c',
	// 			},
	// 		},
	// 	},
	// 	{
	// 		name: '南京南运用所',
	// 		type: 'line',
	// 		data: [32,12,43,34,45,12,23,32,44,7,9,6],
	// 		// smooth: true,
	// 		itemStyle:{
	// 			normal:{
	// 				color: '#ffde38'
	// 			}
	// 		}
	// 	},
	// 	{
	// 		name: '合肥南运用所',
	// 		type: 'line',
	// 		data: [45,12,34,45,9,97,87,56,78,44,55],
	// 		// smooth: true,
	// 		itemStyle:{
	// 			normal:{
	// 				color: '#12db6a'
	// 			}
	// 		}
	// 	},
	// 	{
	// 		name: '徐州东运用所',
	// 		type: 'line',
	// 		data: [88,77,55,66,44,22,33,11,34,4,67,43],
	// 		// smooth: true,
	// 		itemStyle:{
	// 			normal:{
	// 				color: '#22fce7'
	// 			}
	// 		}
	// 	},
	// ];
	echarts.init(document.getElementById('comm_botEchart')).dispose(); //先销毁
	let ele = echarts.init(document.getElementById('comm_botEchart'));
	let curInt;
	let option = {
		title:{
			text: '单位（分）',
			textStyle:{
				fontSize: HTML_fontSize*0.75,
				// color: '#5e6081',
				color: '#fff',
			},
			right: 0,
			top: '5%',
		},
		legend:{
			// type: 'scroll',
			// orient: 'vertical',
			icon:"rect",
			itemWidth: HTML_fontSize*0.625,
			itemHeight: HTML_fontSize*0.625,
			// icon:"image:///static/img/close_in.png",
			show: true,
			left: '0',
			right: '10%',
			top: '5%',
			itemGap: 15, //每项间隔
			textStyle: {
				fontSize: HTML_fontSize*0.75,
				// color: '#5e6081',
				color: '#fff',
			},
			data: nameList,
			// formatter: function(name){
			// 	console.log(name);
			// }
			// selectedMode: false, //图例点击事件
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: { // 坐标轴指示器，坐标轴触发有效
				//type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
				lineStyle: {
					// color: '#5e6081',
					color: '#fff',
					width: 1,
					// shadowColor: 'rgba(89, 142, 255, 0.5)',
					// shadowBlur: 10
				}
			}
		},
		grid: {
			left: '0%',
			right: '10%',
			top: '25%',
			bottom: '12%',
			containLabel: true
		},
		xAxis: [ //x轴坐标xAxis的字体颜色大小，坐标线颜色，以及网格线的设置
			{
				type: 'category',
				data: nameData,
				boundaryGap: false, //两边留白
				axisTick: {
					show: false,
					alignWithLabel: true
				},
				axisLine: {
					show: false,
					lineStyle: {
						type: 'solid',
						color: '#000', //坐标轴的颜色
						width: '1' //坐标线的宽度
					}
				},
				axisLabel: {
					show: true,
					textStyle: {
						// color: '#5e6081', //坐标值得具体的颜色
						color: '#fff',
						fontSize: HTML_fontSize*0.75,
					},
					interval:0,
					rotate: -30,
				},
				splitLine: { //网格样式
					show: false,
					lineStyle: {
						color: ['#ebebeb'],
						width: 2,
						type: 'solid'
					}
				}
			}
		],
		
		yAxis: [ //y轴坐标xAxis的字体颜色大小，坐标线颜色，以及网格线的设置
			{
				type: 'value',
				minInterval: 1,
				axisTick:{
					show: false,
				},
				axisLine: {
					show: false,
					lineStyle: {
						type: 'solid',
						color: '#000', //坐标轴的颜色
						width: '1' //坐标线的宽度
					}
				},
				axisLabel: {
					textStyle: {
						// color: '#5e6081', //坐标值得具体的颜色
						color: '#fff',
						fontSize: HTML_fontSize*0.75,
					},
					interval:0,
				},
				splitLine: { //网格样式
					show: true,
					lineStyle: {
						color: ['#00284c'],
						width: 1,
						type: 'solid'
					}
				}
			}
		],
		series: scoreData,
	};
	ele.setOption(option);
}

function getComm_topEchart(){ //获取质量评价-top柱状图数据
	//获取当前日期
	let myDate = new Date();
	let nowY = myDate.getFullYear();
	let nowM = myDate.getMonth()+1;
	let endDate = nowY + "-" + (nowM < 10 ? "0" + nowM : nowM);//当前日期
	
	//获取三十天前日期
	let lw = new Date(myDate - 1000 * 60 * 60 * 24 * 30);
	let lastY = lw.getFullYear();
	let lastM = lw.getMonth()+1;
	let startDate = lastY + "-" + (lastM < 10 ? "0" + lastM : lastM);//三十天之前日期
	// $.ajax({
	// 	url: request_api + '/qualityManage/getDeptScore',
	// 	data: {
	// 		startDate: startDate,
	// 		endDate: endDate,
	// 	},
	// 	type: 'post',
	// 	dataType: 'json',
	// 	success: res => {
	// 		console.log(res);
	// 		let getData = res;
			let getData = [
				{
					"deptCode":"",
					"deptName":"",
					"evaluationBenefit":"",
					"sAnswerPoint":"",
					"sConPoint":"",
					"sLinXiuConfirmPoint":"",
					"sReworkPoint":"",
					"score":60,
					"stuffNum":0,
					"unitCode":"024",
					"unitIp":"172.21.4.114",
					"unitName":"南京动车组运用所",
					"unitValue":1
				},
				{
					"deptCode":"",
					"deptName":"",
					"evaluationBenefit":"",
					"sAnswerPoint":"",
					"sConPoint":"",
					"sLinXiuConfirmPoint":"",
					"sReworkPoint":"",
					"score":75,
					"stuffNum":0,
					"unitCode":"029",
					"unitIp":"172.20.104.141",
					"unitName":"南京南动车组运用所",
					"unitValue":1
				},
				{
					"deptCode":"",
					"deptName":"",
					"evaluationBenefit":"",
					"sAnswerPoint":"",
					"sConPoint":"",
					"sLinXiuConfirmPoint":"",
					"sReworkPoint":"",
					"score":15,
					"stuffNum":0,
					"unitCode":"044",
					"unitIp":"1",
					"unitName":"合肥南动车组运用所",
					"unitValue":1
				},
				{
					"deptCode":"",
					"deptName":"",
					"evaluationBenefit":"",
					"sAnswerPoint":"",
					"sConPoint":"",
					"sLinXiuConfirmPoint":"",
					"sReworkPoint":"",
					"score":30,
					"stuffNum":0,
					"unitCode":"058",
					"unitIp":"1",
					"unitName":"徐州东动车组运用所",
					"unitValue":1
				}
			];
			setComm_topEchart(getData); //设置质量评价-top柱状图
	// 	},
	// 	error: err => {
	// 		if(err.readyState == 0){
	// 			$.showInforDlg('提示','网络异常，请检查网络！',2);
	// 		}else{
	// 			$.showInforDlg('提示','获取质量评价柱状图失败！',7);
	// 		}
	// 		console.log(err);
	// 	},
	// 	complete: () => {
			
	// 	}
	// })
}
function setComm_topEchart(getData){ //设置质量评价-top柱状图
	let colorList = ['#22fce7','#12db6a','#ffde38','#ff616c'];
	let nameData = [];
	let scoreData = [];
	for(let item of getData){
		nameData.push(item.unitName);
		scoreData.push(item.score);
	}
	echarts.init(document.getElementById('comm_topEchart')).dispose(); //先销毁
	let ele = echarts.init(document.getElementById('comm_topEchart'));
	let curInt;
	let option = {
		title:{
			text: '单位（分）',
			textStyle:{
				fontSize: HTML_fontSize*0.75,
				// color: '#5e6081',
				color: '#fff',
			},
			right: 0,
			top: '5%',
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: { // 坐标轴指示器，坐标轴触发有效
				type: 'shadow' ,// 默认为直线，可选为：'line' | 'shadow'
				shadowStyle:{
					color: 'rgba(255,255,255,0)'
				}
			},
		},
		grid: {
			left: '0%',
			right: '5%',
			top: '15%',
			bottom: '10%',
			containLabel: true
		},
		yAxis: [ //x轴坐标xAxis的字体颜色大小，坐标线颜色，以及网格线的设置
			{
				type: 'category',
				data: nameData,
				axisTick: {
					show: false,
					alignWithLabel: true
				},
				axisLine: {
					show: false,
					lineStyle: {
						type: 'solid',
						color: '#ebebeb', //坐标轴的颜色
						width: '2' //坐标线的宽度
					}
				},
				axisLabel: {
					textStyle: {
						// color: '#aeb0e3', //坐标值得具体的颜色
						color: '#fff',
						fontSize: HTML_fontSize*0.75,
					}
				}
			}
		],
		
		xAxis: [ //y轴坐标xAxis的字体颜色大小，坐标线颜色，以及网格线的设置
			{
				show: false,
				type: 'value',
				axisLine: {
					show: false,
					lineStyle: {
						type: 'solid',
						color: '#ebebeb', //坐标轴的颜色
						width: '2' //坐标线的宽度
					}
				},
				axisLabel: {
					show: false,
					textStyle: {
						color: '#666666', //坐标值得具体的颜色
						fontSize: '15',
					}
				},
				splitLine: { //网格样式
					show: false,
					lineStyle: {
						color: ['#ebebeb'],
						width: 2,
						type: 'solid'
					}
				}
			}
		],
		series: [
			{
				//name: 'XXXXXXX',
				type: 'bar',
				barWidth: HTML_fontSize*0.437,
				data: scoreData,
				itemStyle:{
					normal:{
						// color: function(params) {
		    //                 var key = params.dataIndex;
		    //                 if(key  == curInt){
		    //                     return "#000"; //点击变的色
		    //                 }else{
		    //                     return "#f7d081";
		    //                 }
		    //             },
						barBorderRadius: 5,
						color: function(data){
							return colorList[data.dataIndex];
						},
						label: {
							show: true, //开启显示
							position: 'right', //在右侧显示
							textStyle: { //数值样式
								color: function(data){
									return colorList[data.dataIndex];
								},
								fontSize: HTML_fontSize*0.75
							}
						}
					}
				}
			}
		],
	};
	
	ele.setOption(option);
}

function getPhotoStatistics(){ //获取雷达图数据
	let stuffCode = $('.photoActive').data('code'); //人员code
	let unitCode; //运用所code
	let deptCode; //质检组code
	for(let wapper of photoListData){
		for(let item of wapper.group){
			if(item.code == stuffCode){
				unitCode = item.unitCode;
				deptCode = item.deptCode
			}
		}
	}
	//获取当前日期
	let myDate = new Date();
	let nowY = myDate.getFullYear();
	let nowM = myDate.getMonth(); //上一个月份
	
	if(nowM == 0){ //当前是一月份，上一个月就是上一年的12月
		nowY = nowY - 1;
		nowM = 12;
	}
	let prevDate = nowY + "-" + (nowM < 10 ? "0" + nowM : nowM); //上一个月日期
	
	// $.ajax({
	// 	url: request_api + '/qualityManage/getStuffInfo',
	// 	data: {
	// 		unitCode: unitCode,
	// 		deptCode: deptCode,
	// 		stuffCode: stuffCode,
	// 		endDate: prevDate
	// 	},
	// 	type: 'post',
	// 	dataType: 'json',
	// 	success: res => {
	// 		console.log(res);
			
			setPhotoStatistics('res'); //设置雷达图
	// 	},
	// 	error: err => {
	// 		if(err.readyState == 0){
	// 			$.showInforDlg('提示','网络异常，请检查网络！',2);
	// 		}else{
	// 			$.showInforDlg('提示','获取雷达图失败！',7);
	// 		}
	// 		console.log(err);
	// 	},
	// 	complete: () => {
			
	// 	}
	// })
}
function setPhotoStatistics(getData){ //设置雷达图
	getData = {
		"stuffScore":{
			"sAnswerPoint": Math.round(Math.random() * 100),
			"sAnswerSum":"4",
			"sConFirmationRate":"100%",
			"sConPoint": Math.round(Math.random() * 100),
			"sConRate":"100%",
			"sConTrastSum":"0",
			"sConpLete":"100.0%",
			"sContrastPoint": Math.round(Math.random() * 100),
			"sErroAnswer":"3",
			"sEvaluationPoint": Math.round(Math.random() * 100),
			"sFualtPoint": Math.round(Math.random() * 100),
			"sFualtReal":"0",
			"sFualtSum":"0",
			"sIsId":"573f59b42df84ce9be56d5b4fd99e7ff",
			"sRealAnswer":"4",
			"sRealContrastSum":"0",
			"sReworkPoint": Math.round(Math.random() * 100),
			"sTotalpoints":"92.5",
			"sWorkScoreId":"61cf81e4dc874650a90f88d07d494cdb"
		}
	}
	let sFualtPoint = getData.stuffScore.sFualtPoint == '' ? 0 : getData.stuffScore.sFualtPoint;
	let sContrastPoint = getData.stuffScore.sContrastPoint == '' ? 0 : getData.stuffScore.sContrastPoint;
	let sAnswerPoint = getData.stuffScore.sAnswerPoint == '' ? 0 : getData.stuffScore.sAnswerPoint;
	let sEvaluationPoint = getData.stuffScore.sEvaluationPoint == '' ? 0 : getData.stuffScore.sEvaluationPoint;
	let sConPoint = getData.stuffScore.sConPoint == '' ? 0 : getData.stuffScore.sConPoint;
	let sReworkPoint = getData.stuffScore.sReworkPoint == '' ? 0 : getData.stuffScore.sReworkPoint;
	
	let linxiuScore = parseInt(sFualtPoint) + parseInt(sContrastPoint);
	let valueList = [ //分数
		sAnswerPoint,
		sEvaluationPoint,
		sConPoint,
		linxiuScore,
		sReworkPoint,
	];
	let maxScore = 0; //五个中的最大值
	let allScore = 0; //算总分
	for(let item of valueList){
		item = parseInt(item);
		allScore += item;
		if(item > maxScore){
			maxScore = item;
		}
	}
	maxScore = maxScore + 10;
	let nameList = [
		{ name: '答题得分', max: maxScore },
		{ name: '效率评价得分', max: maxScore },
		{ name: '派工单得分', max: maxScore },
		{ name: '临修确认得分', max: maxScore },
		{ name: '返工返修得分', max: maxScore },
	];
	echarts.init(document.getElementById('photoStatistics')).dispose(); //先销毁
	let ele = echarts.init(document.getElementById('photoStatistics'));
	let option = {
		// backgroundColor: 'rgba(204,204,204,0.7 )', // 背景色，默认无背景	rgba(51,255,255,0.7)
		// title: {
		// 	text: '各教育阶段男女人数统计',
		// 	target: 'blank',
		// 	top: '5%',
		// 	left: '3%',
		// 	textStyle: {
		// 		color: '#fff',
		// 		fontSize: 20,
		// 	}
		// },
		// 
		legend: {                        // 图例组件
		    show: false,         
		    icon: 'rect',                   // 图例项的 icon。ECharts 提供的标记类型包括 'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'也可以通过 'image://url' 设置为图片，其中 url 为图片的链接，或者 dataURI。可以通过 'path://' 将图标设置为任意的矢量路径。         
		    top : '40%',                    // 图例距离顶部边距
		    left : '15%',                   // 图例距离左侧边距
		    itemWidth: 10,                  // 图例标记的图形宽度。[ default: 25 ]
		    itemHeight: 10,                 // 图例标记的图形高度。[ default: 14 ]
		    itemGap: 30,                	// 图例每项之间的间隔。[ default: 10 ]横向布局时为水平间隔，纵向布局时为纵向间隔。
		    orient: 'vertical',             // 图例列表的布局朝向,'horizontal'为横向,''为纵向.
		    textStyle: {                    // 图例的公用文本样式。
		        fontSize: 15,
		        color: '#fff'
		    },
		    data: [{                    // 图例的数据数组。数组项通常为一个字符串，每一项代表一个系列的 name（如果是饼图，也可以是饼图单个数据的 name）。图例组件会自动根据对应系列的图形标记（symbol）来绘制自己的颜色和标记，特殊字符串 ''（空字符串）或者 '\n'（换行字符串）用于图例的换行。
		        name: '',                 // 图例项的名称，应等于某系列的name值（如果是饼图，也可以是饼图单个数据的 name）。                    
		        icon: 'rect',               // 图例项的 icon。
		        textStyle: {                // 图例项的文本样式。
		            color: 'rgba(51,0,255,1)',
		            fontWeight: 'bold'		// 文字字体的粗细，可选'normal'，'bold'，'bolder'，'lighter'
		        }
		    }],
		},
		radar: [{                       // 雷达图坐标系组件，只适用于雷达图。
		    center: ['50%', '57%'],             // 圆中心坐标，数组的第一项是横坐标，第二项是纵坐标。[ default: ['50%', '50%'] ]
		    radius: HTML_fontSize*2.5,                        // 圆的半径，数组的第一项是内半径，第二项是外半径。
		    startAngle: 90,                     // 坐标系起始角度，也就是第一个指示器轴的角度。[ default: 90 ]
		    name: {                             // (圆外的标签)雷达图每个指示器名称的配置项。
				show: true,
		        textStyle: {
		            fontSize: HTML_fontSize*0.75,
					lineHeight: HTML_fontSize*0.75,
		            // color: '#aeb0e3',
					color: '#fff',
		        },
				formatter: function(name,data){
					return '\n\n' + name; //腾出百分比节点的位置
				}
		    },
		    nameGap: 5,                        // 指示器名称和指示器轴的距离。[ default: 15 ]
		    splitNumber: 4,                     // (这里是圆的环数)指示器轴的分割段数。[ default: 5 ]
		    shape: 'polygon',                    // 雷达图绘制类型，支持 'polygon'(多边形) 和 'circle'(圆)。[ default: 'polygon' ]
		    axisLine: {                         // (圆内的几条直线)坐标轴轴线相关设置
		        lineStyle: {
		            color: '#164c73',                   // 坐标轴线线的颜色。
		            width: 1,                      	 // 坐标轴线线宽。
		            type: 'solid',                   // 坐标轴线线的类型。
		        }
		    },
		    splitLine: {                        // (这里是指所有圆环)坐标轴在 grid 区域中的分隔线。
		        lineStyle: {
		            color: '#164c73',                       // 分隔线颜色
		            width: 1, 							 // 分隔线线宽
		        }
		    },
		    splitArea: {                        // 坐标轴在 grid 区域中的分隔区域，默认不显示。
		        show: false,
		        areaStyle: {                            // 分隔区域的样式设置。
		            color: ['rgba(250,250,250,0.3)','rgba(200,200,200,0.3)'],       // 分隔区域颜色。分隔区域会按数组中颜色的顺序依次循环设置颜色。默认是一个深浅的间隔色。
		        }
		    },
		    indicator: nameList
		}],
		series: [{
		    name: '雷达图',             // 系列名称,用于tooltip的显示，legend 的图例筛选，在 setOption 更新数据和配置项时用于指定对应的系列。
		    type: 'radar',              // 系列类型: 雷达图
		    itemStyle: {                // 折线拐点标志的样式。
		        normal: {                   // 普通状态时的样式
		            lineStyle: {
		                width: 1
		            },
		            opacity: 0.2
		        },
		        emphasis: {                 // 高亮时的样式
		            lineStyle: {
		                width: 5
		            },
		            opacity: 1
		        }
		    },
		    data: [{                    // 雷达图的数据是多变量（维度）的
		        name: '',                 // 数据项名称
		        value: valueList,        // 其中的value项数组是具体的数据，每个值跟 radar.indicator 一一对应。
		        symbol: 'circle',                   // 单个数据标记的图形。
		        symbolSize: 0,                      // 单个数据标记的大小，可以设置成诸如 10 这样单一的数字，也可以用数组分开表示宽和高，例如 [20, 10] 表示标记宽为20，高为10。
		        label: {                    // 单个拐点文本的样式设置                            
		                normal: {  
		                    show: false,             // 单个拐点文本的样式设置。[ default: false ]
		                    position: 'top',        // 标签的位置。[ default: top ]
		                    distance: 5,            // 距离图形元素的距离。当 position 为字符描述值（如 'top'、'insideRight'）时候有效。[ default: 5 ]
		                    color: 'rgba(255,0,0,1)',          // 文字的颜色。如果设置为 'auto'，则为视觉映射得到的颜色，如系列色。[ default: "#fff" ]
		                    fontSize: 12,           // 文字的字体大小
		                    formatter:function(params) {  
		                        return params.value;  
		                    }  
		                }  
		            },
		        itemStyle: {                // 单个拐点标志的样式设置。
		            normal: {
		                borderColor: 'rgba(255,0,0,1)',       // 拐点的描边颜色。[ default: '#000' ]
		                borderWidth: 0,                        // 拐点的描边宽度，默认不描边。[ default: 0 ]
		            }
		        },
		        lineStyle: {                // 单项线条样式。
		            normal: {
		                opacity: 0.5,            // 图形透明度
						color: 'rgba(34,252,231,0.6)'
		            }
		        },
		        areaStyle: {                // 单项区域填充样式
		            normal: {
		                color: 'rgba(34,252,231,0.6)'       // 填充的颜色。[ default: "#000" ]
		            }
		        }
		    },]
		},]
	}
	ele.setOption(option);
	
	//Math.round
	$('.photoStatistics_top').text(sAnswerPoint);
	$('.photoStatistics_left1').text(sEvaluationPoint);
	$('.photoStatistics_left2').text(sConPoint);
	$('.photoStatistics_right2').text(linxiuScore);
	$('.photoStatistics_right1').text(sReworkPoint);
	
}

function getUserStatistics(){ //获取用户统计
	//当前本地时间
	let thisDate = new Date();
	//获取年月日时分秒
	let y = thisDate.getFullYear();
	let m = thisDate.getMonth() + 1 > 9 ? thisDate.getMonth() + 1 : '0' + (thisDate.getMonth() + 1);
	let d = thisDate.getDate() > 9 ? thisDate.getDate() : '0' + thisDate.getDate();
	let h = thisDate.getHours() > 9 ? thisDate.getHours() : '0' + thisDate.getHours();
	let mi = thisDate.getMinutes() > 9 ? thisDate.getMinutes() : '0' + thisDate.getMinutes();
	let s = thisDate.getSeconds() > 9 ? thisDate.getSeconds() : '0' + thisDate.getSeconds();
	let thisTime = y + '-' + m + '-' + d + ' ' + h + ':' + mi + ':' + s;
	//获取当前日期
	let myDate = new Date();
	let nowY = myDate.getFullYear();
	let nowM = myDate.getMonth()+1;
	let endDate = nowY + "-" + (nowM < 10 ? "0" + nowM : nowM);//当前日期
	
	//获取三十天前日期
	let lw = new Date(myDate - 1000 * 60 * 60 * 24 * 30);
	let lastY = lw.getFullYear();
	let lastM = lw.getMonth()+1;
	let startDate = lastY + "-" + (lastM < 10 ? "0" + lastM : lastM);//三十天之前日期
	// $.ajax({
	// 	url: request_api + '/qualityManage/getUnitAndDeptInfo',
	// 	data: {
	// 		thisTime: thisTime,
	// 		startDate: startDate,
	// 		endDate: endDate,
	// 	},
	// 	type: 'post',
	// 	dataType: 'json',
	// 	success: res => {
	// 		console.log(res);
	// 		let getData = res;
			let getData = [
				{
					"deptCode":"0059500860",
					"deptName":"质检组",
					"evaluationBenefit":"10",
					"sAnswerPoint":"20",
					"sConPoint":"30",
					"sLinXiuConfirmPoint":"40",
					"sReworkPoint":"50",
					"score":10,
					"stuffNum":0,
					"unitCode":"024",
					"unitIp":"172.21.4.114",
					"unitName":"南京动车组运用所",
					"unitValue":1
				},
				{
					"deptCode":"0059500994",
					"deptName":"质检组",
					"evaluationBenefit":"50",
					"sAnswerPoint":"40",
					"sConPoint":"30",
					"sLinXiuConfirmPoint":"20",
					"sReworkPoint":"10",
					"score":20,
					"stuffNum":0,
					"unitCode":"024",
					"unitIp":"172.21.4.114",
					"unitName":"南京动车组运用所",
					"unitValue":1
				},
				{
					"deptCode":"0059500686",
					"deptName":"质检组",
					"evaluationBenefit":"30",
					"sAnswerPoint":"10",
					"sConPoint":"30",
					"sLinXiuConfirmPoint":"30",
					"sReworkPoint":"60",
					"score":30,
					"stuffNum":3,
					"unitCode":"029",
					"unitIp":"172.20.104.141",
					"unitName":"南京南动车组运用所",
					"unitValue":1
				},
				{
					"deptCode":"0059500944",
					"deptName":"质检组",
					"evaluationBenefit":"20",
					"sAnswerPoint":"20",
					"sConPoint":"50",
					"sLinXiuConfirmPoint":"30",
					"sReworkPoint":"10",
					"score":40,
					"stuffNum":0,
					"unitCode":"029",
					"unitIp":"172.20.104.141",
					"unitName":"南京南动车组运用所",
					"unitValue":1
				},
				{
					"deptCode":"0059501090",
					"deptName":"质检组",
					"evaluationBenefit":"70",
					"sAnswerPoint":"60",
					"sConPoint":"50",
					"sLinXiuConfirmPoint":"40",
					"sReworkPoint":"30",
					"score":50,
					"stuffNum":0,
					"unitCode":"044",
					"unitIp":"1",
					"unitName":"合肥南动车组运用所",
					"unitValue":1
				},
				{
					"deptCode":"0059501133",
					"deptName":"质检一组",
					"evaluationBenefit":"50",
					"sAnswerPoint":"60",
					"sConPoint":"9",
					"sLinXiuConfirmPoint":"20",
					"sReworkPoint":"30",
					"score":60,
					"stuffNum":0,
					"unitCode":"044",
					"unitIp":"1",
					"unitName":"合肥南动车组运用所",
					"unitValue":1
				},
				{
					"deptCode":"0059501134",
					"deptName":"质检二组",
					"evaluationBenefit":"10",
					"sAnswerPoint":"30",
					"sConPoint":"20",
					"sLinXiuConfirmPoint":"40",
					"sReworkPoint":"50",
					"score":70,
					"stuffNum":0,
					"unitCode":"044",
					"unitIp":"1",
					"unitName":"合肥南动车组运用所",
					"unitValue":1
				},
				{
					"deptCode":"0059601310",
					"deptName":"质检组",
					"evaluationBenefit":"70", //效率评价
					"sAnswerPoint":"60", //答题
					"sConPoint":"70", //派工单
					"sLinXiuConfirmPoint":"60", //临修
					"sReworkPoint":"70", //返工返修
					"score":80,
					"stuffNum":0,
					"unitCode":"058",
					"unitIp":"1",
					"unitName":"徐州东动车组运用所",
					"unitValue":1
				}
			];
			let obj = '';
			for(let i=0; i<getData.length; i++){
				let item = getData[i];
				//默认第一个为选中
				let chooseClass = i == 0 ? 'glyphicon-play' : '';
				//运用所名+质检组名 --- 质检组名固定为'质检组'
				let row = item.unitName + '（' + '质检组' + '）'; //item.deptName
				obj += '<li class="userStatisticsList_li swiper-slide glyphicon ' + chooseClass + '" data-evaluationbenefit="' + item.evaluationBenefit + '" data-sanswerpoint="' + item.sAnswerPoint + '" data-sconpoint="' + item.sConPoint + '" data-slinxiuconfirmpoint="' + item.sLinXiuConfirmPoint + '" data-sreworkpoint="' + item.sReworkPoint + '">';
				obj += '	<span class="userStatisticsList_li_name">' + row + '</span>';
				obj += '	<span class="userStatisticsList_li_peoNum">' + item.stuffNum + '人</span>';
				obj += '	<div class="clearBoth"></div>';
				obj += '</li>';
			}
			
			//如果存在轮播实例 - 先销毁->更新数据->重新加载swiper
			if(swiper_userStatList != null){
				swiper_userStatList.destroy(); //销毁
			}
			
			$('#userStatisticsList').children().remove();
			$('#userStatisticsList').append(obj);
			
			//加载swiper
			swiper_userStatList = new Swiper('#statistics_contentBox .swiper-container', {
			   direction: 'vertical', //切换选项 垂直：vertical， 水平：horizontal
			   loop: true, //循环模式选项
			   autoplay: false,
			   grabCursor: true, //鼠标覆盖Swiper时指针会变成手掌形状，拖动时指针会变成抓手形状
			   slidesPerView: 4, //设置slider容器能够同时显示的slides数量
			   slidesPerGroup: 4, //定义slides的数量多少为一组
			   spaceBetween: HTML_fontSize*0.75,
			   effect: 'slide', //切换效果，默认为"slide"（位移切换），可设置为'slide'（普通切换、默认）,"fade"（淡入）"cube"（方块）"coverflow"（3d流）"flip"（3d翻转）
			   loop: true, //设置为true 则开启loop模式。loop模式：会在原本slide前后复制若干个slide(默认一个)并在合适的时候切换，让Swiper看起来是循环的。 loop模式在与free模式同用时会产生抖动，因为free模式下没有复制slide的时间点
			   loopFillGroupWithBlank: true, //在loop模式下，为group填充空白slide
			   observer:true, //修改swiper自己或子元素时，自动初始化swiper 
			   observeParents:false, //修改swiper的父元素时，自动初始化swiper 
			})
			//默认第一项
			let userData = {
				evaluationBenefit: getData[0].evaluationBenefit, //效率评价
				sAnswerPoint: getData[0].sAnswerPoint, //答题
				sConPoint: getData[0].sConPoint, //派工单
				sLinXiuConfirmPoint: getData[0].sLinXiuConfirmPoint, //临修
				sReworkPoint: getData[0].sReworkPoint, //返工返修
			}
			setUserStatistics(userData); //设置用户统计环状图
	// 	},
	// 	error: err => {
	// 		if(err.readyState == 0){
	// 			$.showInforDlg('提示','网络异常，请检查网络！',2);
	// 		}else{
	// 			$.showInforDlg('提示','获取用户统计失败！',7);
	// 		}
	// 		console.log(err);
	// 	},
	// 	complete: () => {
			
	// 	}
	// })
}
function setUserStatistics(getData){ //设置用户统计环状图
	let dataList = [
		{ name: '答题得分', value: getData.sAnswerPoint },
		{ name: '效率评价得分', value: getData.evaluationBenefit },
		{ name: '派工单得分', value: getData.sConPoint },
		{ name: '临修确认得分', value: getData.sLinXiuConfirmPoint },
		{ name: '返工返修得分', value: getData.sReworkPoint },
	];
	let nameList = ['答题得分','效率评价得分','派工单得分','临修确认得分','返工返修得分'];
	let allScore = 0;
	for(let item of dataList){
		allScore += parseInt(item.value);
	}
	echarts.init(document.getElementById('userStatisticsEle')).dispose(); //先销毁
	let ele = echarts.init(document.getElementById('userStatisticsEle'));
	let curInt;
	let option = {
		// title:{
		// 	text: '',
		// 	textStyle:{
		// 		fontSize: ''
		// 	}
		// },
		color:['#22fce7','#12db6a','#ffde38','#ff616c','#984ed7'],
		tooltip: {
			trigger: 'item',
//			        formatter: "{a} <br/>{b}: {c} ({d}%)"
			formatter: data => {
				// console.log(data);
				let obj = data.marker + data.seriesName + "<br>" + data.name + '：' + data.value + " (" + Math.round(data.percent) + '%)';
				return obj;
			}
		},
		legend: {
			// type: 'scroll',
			// orient: 'vertical',
			icon:"rect",
			itemWidth: HTML_fontSize*0.625,
			itemHeight: HTML_fontSize*0.625,
			// icon:"image:///static/img/close_in.png",
			show: true,
			x: 'left',
			bottom: -5,
			itemGap: 9, //每项间隔
			textStyle: {
				fontSize: HTML_fontSize*0.75,
				// color: '#aeb0e3',
				color: '#fff',
			},
			data: nameList,
			// formatter: function(name){
			// 	console.log(name);
			// }
			selectedMode: false, //图例点击事件
		},
		series: [{
			itemStyle:{
				normal: {
					// borderWidth: 1, 
					// borderColor: '#fff',
				}
			},
			name:'详细',
			type:'pie',
			center: ['75%', '45%'],
			radius: ['40%', '55%'],
			avoidLabelOverlap: false,
			label: {
				normal: {
					show: true,
					textStyle: {
						fontSize: HTML_fontSize*0.75,
					},
					formatter: data => {
						return Math.round(data.percent) + "%";
					}
				},
			},
			labelLine: {
				normal: {
					show: true,
					length: 4
				}
			},
			data: dataList,
		 }],
		// graphic:{       //图形中间文字
	 //        type:"text",
	 //        left:"center",
	 //        top:"center",
	 //        style:{
	 //            text: allScore, // + "\n故障总数",
	 //            textAlign:"center",
	 //            fill:"#000",
	 //            fontSize: 50,
	 //            fontWeight: 900
	 //        }
	 //    },
	};
	ele.setOption(option);
	
	$('.userStatistics_allScoreBox .allScore').text(allScore);
}

 //获取详情数据(质量鉴定)-detailData:参数 whichFn:判断是哪个详情
function getDetailPopData_quality(detailData, whichFn){
// 	console.log(detailData);
// 	detailData = JSON.stringify(detailData);
// 	$.ajax({
// 		url: request_api + '/AppraisalStatistics/getStatisticsDetails',
// 		data: {
// 			dataList: detailData
// 		},
// 		type: 'post',
// 		dataType: 'json',
// 		success:function(res){
// 			console.log(res);
// 			let data = res.qcMQualityidenFaults;
// 			for(let item of data){ //截时间
// 				item.dIdentifytime = item.dIdentifytime.slice(0,10);
// 			}
// 			$('#detailTit').text(whichFn);
// 			let detailTableEle = '';
// 			detailTableEle += '<tr>';
// 			detailTableEle += '	<th style="width: 50px;">序号</th>';
// 			detailTableEle += '	<th style="width: 95px;">日期</th>';
// 			detailTableEle += '	<th style="width: 160px;">车组名称</th>';
// 			detailTableEle += '	<th style="width: 50px;">辆序</th>';
// 			detailTableEle += '	<th style="width: 150px;">故障类型</th>';
// 			detailTableEle += '	<th style="width: calc(100% - 635px);" class="moreArticle">故障内容</th>';
// 			detailTableEle += '	<th style="width: 65px;">整改人</th>';
// 			detailTableEle += '	<th style="width: 85px;">整改班组</th>';
// 			detailTableEle += '	<th style="width: 85px;">整改情况</th>';
// 			detailTableEle += '	<th style="width: 65px;">质检员</th>';
// 			detailTableEle += '</tr>';
// 			$('#detailTable_head').children().remove();
// 			$('#detailTable_head').append(detailTableEle);
// 			for(let i=0; i<data.length; i++){
// 				let item = data[i];
// 				let iStatus;
// 				if(item.iStatus == '0'){
// 					iStatus = '未整改';
// 				}else if(item.iStatus == '1'){
// 					iStatus = '已整改';
// 				}else if(item.iStatus == '2'){
// 					iStatus = '已质检';
// 				}
// 				detailTableEle += '<tr>';
// 				detailTableEle += '	<td>' + (i+1) + '</td>';
// 				detailTableEle += '	<td>' + item.dIdentifytime + '</td>';
// 				detailTableEle += '	<td>' + item.trainsetName + '</td>';
// 				detailTableEle += '	<td>' + item.sCarNo + '</td>';
// 				detailTableEle += '	<td>' + item.faultclassname + '</td>';
// 				detailTableEle += '	<td>' + item.sFaultcontent + '</td>';
// 				detailTableEle += '	<td>' + item.sRepairStuffName + '</td>';
// 				detailTableEle += '	<td>' + item.dealwithdeptName + '</td>';
// 				detailTableEle += '	<td>' + iStatus + '</td>';
// 				detailTableEle += '	<td>' + item.sSigStuffName + '</td>';
// 				detailTableEle += '</tr>';
// 			}
// 			$('#detailTable').children().remove();
// 			$('#detailTable').append(detailTableEle);
// 			$('#detailTotal').text('共' + data.length + '条');
// 			$('#statisticsPop').fadeIn(500, () => {
// 				let tableWidth = $('#detailTable')[0].offsetWidth; //赋值表头width
// 				$('#detailTable_head').css('width', tableWidth + 'px');
// 			});
			
// 			$('.moreArticle').each(function(i,e){ //判断加气泡
// 				if(e.clientHeight < e.scrollHeight){ //固定高度小于实际高度 => 溢出
// 					//溢出的节点添加一个兄弟节点-做气泡
// 					$(e).parent().append('<div class="tableProjectShowAllEle pub-background-color-000">' + $(e).html() + '</div>');
// 					//溢出添加...
// 					$(e).css({
// 						'overflow': 'hidden',
// 						'text-overflow': 'ellipsis',
// 						'display': '-webkit-box',
// 						'-webkit-line-clamp': '2',
// 						'-webkit-box-orient': 'vertical',
// 					});
// 				}
// 			})
			
// 		},
// 		error:function(err){
// 			if(err.readyState == 0){
// 				$.showInforDlg('提示','网络异常，请检查网络！',2);
// 			}else{
// 				$.showInforDlg('提示','获取详情失败！',7);
// 			}
// 			console.log(err);
// 		},
// 		complete:function(){
			
// 		}
// 	})
}

//获取详情数据-detailData:参数 whichFn:判断是哪个详情
function getDetailPopData(detailData, whichFn){
// 	console.log(detailData);
// 	detailData = JSON.stringify(detailData);
// 	$.ajax({
// 		url: request_api + '/ReworkRepair/getReworkStatisticsDetails',
// 		data: {
// 			dataList: detailData
// 		},
// 		type: 'post',
// 		dataType: 'json',
// 		success:function(res){
// 			console.log(res);
// 			let data = res.zzReworkRecords;
			
// 			for(let item of data){ //截时间-替换字符
// 				item.dProcessTime = item.dProcessTime.replace(/\//g,"-");
// 				item.dcreateTime = item.dcreateTime.replace(/\//g,"-");
// 			}
			
// 			$('#detailTit').text(whichFn);
// 			let detailTableEle = '';
// 			detailTableEle += '<tr>';
// 			detailTableEle += '	<th style="width: 50px">序号</th>';
// 			detailTableEle += '	<th style="width: 160px">时间</th>';
// 			detailTableEle += '	<th style="width: 135px">车组名称</th>';
// 			detailTableEle += '	<th style="width: calc(100% - 760px)">故障内容</th>';
// 			detailTableEle += '	<th style="width: 150px">类别</th>';
// 			detailTableEle += '	<th style="width: 65px">处理人</th>';
// 			detailTableEle += '	<th style="width: 65px">质检员</th>';
// 			detailTableEle += '	<th style="width: 85px">检修班组</th>';
// 			detailTableEle += '	<th style="width: 50px">等级</th>';
// 			detailTableEle += '</tr>';
// 			$('#detailTable_head').children().remove();
// 			$('#detailTable_head').append(detailTableEle);
// 			for(let i=0; i<data.length; i++){
// 				let item = data[i];
// 				detailTableEle += '<tr>';
// 				detailTableEle += '	<td>' + (i+1) + '</td>';
// 				detailTableEle += '	<td>' + item.dcreateTime + '</td>';
// 				detailTableEle += '	<td>' + item.sTrainSetName + '</td>';
// 				detailTableEle += '	<td><div class="moreArticle">' + item.sFaultName + '</div></td>';
// 				detailTableEle += '	<td><div class="moreArticle">' + item.iworkType + '</div></td>';
// 				detailTableEle += '	<td>' + item.sProcessStuffName + '</td>';
// 				detailTableEle += '	<td>' + item.sQcName + '</td>';
// 				detailTableEle += '	<td>' + item.sProcessDeptName + '</td>';
// 				detailTableEle += '	<td>' + item.sFaultLevel + '</td>';
// 				detailTableEle += '</tr>';
// 			}
// 			$('#detailTable').children().remove();
// 			$('#detailTable').append(detailTableEle);
// 			$('#detailTotal').text('共' + data.length + '条');
// 			$('#statisticsPop').fadeIn(500, () => {
// 				let tableWidth = $('#detailTable')[0].offsetWidth; //赋值表头width
// 				$('#detailTable_head').css('width', tableWidth + 'px');
// 			});
			
// 			$('.moreArticle').each(function(i,e){ //判断加气泡
// 				if(e.clientHeight < e.scrollHeight){ //固定高度小于实际高度 => 溢出
// 					//溢出的节点添加一个兄弟节点-做气泡
// 					$(e).parent().append('<div class="tableProjectShowAllEle pub-background-color-000">' + $(e).html() + '</div>');
// 					//溢出添加...
// 					$(e).css({
// 						'overflow': 'hidden',
// 						'text-overflow': 'ellipsis',
// 						'display': '-webkit-box',
// 						'-webkit-line-clamp': '2',
// 						'-webkit-box-orient': 'vertical',
// 					});
// 				}
// 			})
			
// 		},
// 		error:function(err){
// 			if(err.readyState == 0){
// 				$.showInforDlg('提示','网络异常，请检查网络！',2);
// 			}else{
// 				$.showInforDlg('提示','获取详情失败！',7);
// 			}
// 			console.log(err);
// 		},
// 		complete:function(){
			
// 		}
// 	})
}

$(document).on('click', '.userStatisticsList_li', e => { //用户统计-列表点击事件
	//删除所有选中
	$('.userStatisticsList_li').siblings().removeClass('glyphicon-play');
	//设置当前点击为选中
	$(e.currentTarget).addClass('glyphicon-play');
	let evaluationBenefit = $(e.currentTarget).data('evaluationbenefit');
	let sAnswerPoint = $(e.currentTarget).data('sanswerpoint');
	let sConPoint = $(e.currentTarget).data('sconpoint');
	let sLinXiuConfirmPoint = $(e.currentTarget).data('slinxiuconfirmpoint');
	let sReworkPoint = $(e.currentTarget).data('sreworkpoint');
	let userData = {
		evaluationBenefit: evaluationBenefit, //效率评价
		sAnswerPoint: sAnswerPoint, //答题
		sConPoint: sConPoint, //派工单
		sLinXiuConfirmPoint: sLinXiuConfirmPoint, //临修
		sReworkPoint: sReworkPoint, //返工返修
	}
	setUserStatistics(userData); //设置用户统计环状图
})

$(document).on('click', '#basisWorkBox', e => { //基础作业-弹窗
	//刷新iframe
	$('#basisWorkIframe').attr('src', $('#basisWorkIframe').attr('src'));
	$('#basisWorkPop').fadeIn(); //基础作业弹窗
});

$(document).on('click', '#closeBasisWorkPop', e => { //基础作业关闭
	$('#basisWorkPop').fadeOut();
});

$(document).on('click', '#closeReworkNumPop', e => { //返修单数量关闭
	$('#reworkNumPop').fadeOut();
});

$(document).on('click', '#closeStatisticsPop', e => { //统计详情关闭
	$('#statisticsPop').fadeOut();
});

$(document).on('click','#photoBox .photoEle', e => { //照片列表点击
	$('.photoActive').removeClass('photoActive'); //清除选中
	$(e.currentTarget).addClass('photoActive'); //设置当前节点选中
	photoRelation(); //和照片列表相关联的事件
});

function photoError(e){ //照片默认图片
	return e.src = '/static/img/checkManage/people.png';
}

function interceptingByte(name, maxLength){ //截取字节-参数：截取的字符串，截取的字符数
	for (let i = Math.floor(maxLength / 2); i < name.length; i++){
		//将一个文字换成两个数字
		if (name.substr(0, i).replace(/[^\x00-\xff]/g, '01').length >= maxLength){
			return name.substr(0, Math.floor(i / 2) * 2) + '...';
		}
	}
	return name;
}

$(document).on('click', '#menuSure', e => { //自定义菜单确定按钮
	let menu_timeInp = $('#menu_timeInp').val(); //轮播间隔输入框
	let menu_timeInp2 = $('#menu_timeInp2').val(); //轮播间隔输入框(2)
	if(menu_timeInp != ''){ //不为空
		if(menu_timeInp == '暂停'){
			//更新本地缓存照片轮播间隔
			localStorage.setItem('photoTiming', menu_timeInp);
		}else{
			//更新本地缓存照片轮播间隔
			localStorage.setItem('photoTiming', parseInt(menu_timeInp)*1000);
		}
	}
	if(menu_timeInp2 != ''){ //不为空
		if(menu_timeInp2 == '暂停'){
			//更新本地缓存照片轮播间隔
			localStorage.setItem('bottomLineTiming', menu_timeInp2);
		}else{
			//更新本地缓存照片轮播间隔
			localStorage.setItem('bottomLineTiming', parseInt(menu_timeInp2)*1000);
		}
	}
	layer.load(0, {shade: [0.8, 'rgb(242, 242, 242)'],});
	allDataChange(); //所有数据更新
	//隐藏自定义菜单
	$('#menu').fadeOut(300, () => {
		$('#menu_timeInp').val(''); //清空职工轮播间隔input
		$('#menu_timeInp2').val(''); //清空2轮播间隔input
	});
});

$(document).on('click', '#menuClose', e => { //自定义菜单取消按钮
	//隐藏自定义菜单
	$('#menu').fadeOut(300, () => {
		$('#menu_timeInp').val(''); //清空职工轮播间隔input
		$('#menu_timeInp2').val(''); //清空2轮播间隔input
	});
});

$(document).on('click', '#menu_stop', e => { //自定义菜单暂停
	$('#menu_timeInp').val('暂停');
});

$(document).on('click', '#menu_stop2', e => { //自定义菜单暂停(2)
	$('#menu_timeInp2').val('暂停');
});

$(document).on('click', '#reworkStatistics', e => { //跳转返工返修统计页
	window.open('/ReworkRepair/toReworkRepair');
});

$(document).on('click', '#qualityStatistics', e => { //跳转质量鉴定统计页
	window.open('/AppraisalStatistics/toStatistics');
});

//质检工作日志 iframe加载完成-静态的可以直接操作
// document.getElementById('basisWorkIframe').onload = () => {
// 	let firstPageElement = $("#basisWorkIframe").contents();
// 	$(firstPageElement).ready( () => {
// 		//改样式
// 		let obj = '';
// 		obj += '<style>';
// 		obj += '	#submitBtn,#exportBtn,#saveBtn,.tableEditIcon{';
// 		obj += '		display: none !important;';
// 		obj += '	}';
// 		obj += '	.topForm,.tableBox,.container,.form-control[readonly],.input-group-addon{';
// 		obj += '		background-color: rgba(25,56,107,0.8) !important;';
// 		obj += '	}';
// 		obj += '	.container,.form-control[readonly],.form-control,.input-group-addon{';
// 		obj += '		color: #fff !important;';
// 		obj += '	}';
// 		obj += '	.form-control,.tableTextarea{';
// 		obj += '		background-color: transparent !important';
// 		obj += '	}';
// 		obj += '	#tableId th, #tableId td{';
// 		obj += '		border: 2px solid #071334 !important;';
// 		obj += '		background-color: transparent !important;';
// 		obj += '	}';
// 		obj += '</style>';
// 		firstPageElement.find('head').append(obj);
		
// 		//js
// 		let addJs = '';
// 		addJs += '<script>';
// 		addJs += '	$(document).ajaxStop(function(e){'; //修改表格的内容和属性
// 		addJs += '		$(".tableSelect,.tableTextarea").attr("disabled","true");';
// 		addJs += '		$("#tableDataId img").attr("src", "/static/img/xlsxIcon_no.png")';
// 		addJs += '	});';
// 		addJs += '</script>';
// 		firstPageElement.find('head').append(addJs);
		
// 	});
// }

window.oncontextmenu = e => { //自定义右键菜单
	//鼠标右键的坐标
	let wx = e.clientX;
	let wy = e.clientY;
	//滚动条距离
	let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	let scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
	//取消默认事件
	e.preventDefault();
	//获取自定义的右键菜单
	let menu = document.querySelector("#menu");
	//根据鼠标点击的位置，进行定位
	menu.style.left = wx + scrollLeft + 'px';
	menu.style.top = wy + scrollTop + 'px';
	
	//照片轮播时间
	let localStorage_photoTiming = localStorage.getItem('photoTiming');
	let timing = localStorage_photoTiming == '暂停' ? '暂停' : parseInt(localStorage_photoTiming)/1000; 
	$('#menu_timeInp').attr('placeholder', '当前间隔时间：' + timing);
	//照片轮播时间
	let localStorage_bottomLineTiming = localStorage.getItem('bottomLineTiming');
	let timing2 = localStorage_bottomLineTiming == '暂停' ? '暂停' : parseInt(localStorage_bottomLineTiming)/1000; 
	$('#menu_timeInp2').attr('placeholder', '当前间隔时间：' + timing2);
	//展示菜单
	$(menu).fadeIn(300);
}
window.onclick = e => { //关闭右键自定义菜单
	//滚动条距离
	let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	let scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
	//鼠标点击的坐标
	let wx = e.clientX;
	let wy = e.clientY;
	wx = wx + scrollLeft;
	wy = wy + scrollTop;
	if(wx == scrollLeft && wy == scrollTop){ //选中下拉选，是xy轴0,0
		//取消默认事件
		e.preventDefault();
		return false;
	}
	//判断点击事件是否在自定义菜单内
	let menuEle = document.getElementById('menu');
	//获取展示的自定义菜单坐标范围
	let d_left = menuEle.offsetLeft;
	let d_top = menuEle.offsetTop;
	let d_width = menuEle.clientWidth;
	let d_height = menuEle.clientHeight;
	if (!(wx < d_left || wy < d_top || wx > (d_left + d_width) || wy > (d_top + d_height))){
		//取消默认事件
		e.preventDefault();
	}else{
		//菜单取消按钮事件
		$('#menuClose').click();
	}
}

