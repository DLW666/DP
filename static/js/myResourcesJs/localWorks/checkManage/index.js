
const request_api = requestAPI(); //全局api

var vue = new Vue({
	el: '#vueEl',
	data: {
		imgCarInterval: null, //照片轮播实例
		proCarInterval: null, //项目轮播实例
		dynamicTime: null, //时间-动态
		imgCarouselTime: null, //照片轮播时间-0是停止
		proCarouselTime: null, //项目轮播时间-0是停止
		detailPopShow: false, //返修单弹窗是否展示
		botEchartDataPageList_pageSize: 10, //右下角柱状图分页-每页显示数量
		botEchartDataPageList_pageNum: 1, //右下角柱状图分页-显示第几页
		botEchartDataPageList: [], //右下角柱状图分页页签
		botEchartTime: 10000,//右下角柱状图轮播时间
		botEchartInterval: null, //右下角柱状图轮播实例
		
		peoGroupDetailPop: [], //返修单弹窗列表
		topEchartCode: null, //右上角柱状图获取对应人员需要传的code
		thePageTit: null,//左上角大标题
		myMenu_suo_duan_showOptions: [], //自定义右键菜单的所或段的下拉选
		topEchartData: [], //右上角柱状图
		botEchartData: [], //右下角柱状图展示数据
		botEchartAllData:[], //右下角柱状图所有数据
		peoImgInfo: [], //照片信息，每十个一组-orChoose自定义属性，判断是否选中
		peoHomologousProject: [] //照片对应的项目数据
	},
	mounted() {
		$(document).ajaxStart(function(){
			layer.load(0)
		});
		$(document).ajaxStop(function(){
			layer.closeAll('loading');
		});
		this.getCarouselTimeLocalStorage(); //获取本地缓存中的轮播时间
		this.setContextmenuInpChange(); //轮播时间input监控(项目<职工)
		this.getThisDate(); //动态时间
		this.getMyMenu_suo_duan_showOptions(); //获取自定义右键菜单的所或段的下拉选
	},
	computed: {
		//右上角柱状图标题的展示基于myMenu_suo_duan_showOptions的selected为true的value，1-所,0-段
		topEchartTit(){
			let obj = '';
			for(let item of this.myMenu_suo_duan_showOptions){
				if(item.selected){
					if(item.unitValue == '1'){
						obj = '质检组得分';
					}else{
						obj = '运用所得分';
					}
				}
			}
			return obj;
		},
		//当前页面展示段的还是所得 1-所,0-段
		//基于myMenu_suo_duan_showOptions的selected为true的value
		send_suo_duan_options(){
			let obj = {};
			for(let item of this.myMenu_suo_duan_showOptions){
				if(item.selected){
					obj.unitCode = item.unitCode;
					obj.unitValue = item.unitValue;
				}
			}
			return obj;
		},
		showPeoInfo() { //基于照片信息peoImgInfo数据，返回选中的数据(orChoose为true)
			let showPeoInfo;
			if(this.peoImgInfo.length != 0){
				for (let father of this.peoImgInfo) {
					for (let item of father.group) {
						if (item.orChoose) {
							showPeoInfo = item;
						}
					}
				}
			}else{
				showPeoInfo = {};
			}
			return showPeoInfo;
		}
	},
	watch:{
		botEchartDataPageList_pageNum(newVal,oldVal){ //右下角柱状图显示第几页变化-更新展示数据
			//更新后最后一条数据在总数据中的下标 = 改变后第几页 * 每页显示数量 - 1
			let newEndIndex = newVal * this.botEchartDataPageList_pageSize - 1;
			//更新后第一条数据在总数据中的下标 = 结束下标 - 每页显示数量 + 1
			let newStartIndex = newEndIndex - this.botEchartDataPageList_pageSize + 1;
			let newBotEchartData = [];
			for(let i=newStartIndex; i<this.botEchartAllData.length; i++){
				if(i <= newEndIndex){
					newBotEchartData.push(this.botEchartAllData[i]);
				}
			}
			this.botEchartData = newBotEchartData;
		},
		botEchartData(newVal,oldVal){ //右下角柱状图展示数据变化
			this.getBotEc(); //设置右下角柱状图
			
			clearInterval(this.botEchartInterval); //清除计时器
			//事件里套事件-第一个参数直接写那个方法会导致延迟时间失效，不知道为啥- -
			this.botEchartInterval = setTimeout(() => {
				vue.botEchartPageNext();
			}, vue.botEchartTime);
		},
		//根据右下角柱状图所有数据的变化-设置分页页签-设置展示的数据-设置轮播实例
		botEchartAllData(newVal,oldVal){
			//分几页-总条数/每页显示数量
			let page = Math.ceil(newVal.length / this.botEchartDataPageList_pageSize);
			let botEchartDataPageList = [];
			for(let i=0; i<page; i++){ //设置页签数量
				botEchartDataPageList.push(i+1);
			}
			if(botEchartDataPageList.length == 1){ //只有一页，不显示分页页签
				botEchartDataPageList = [];
			}
			this.botEchartDataPageList = botEchartDataPageList;
			
			let botEchartShowData = []; //设置展示的数据-默认展示第一页
			for(let i=0; i<this.botEchartAllData.length; i++){
				if(i < this.botEchartDataPageList_pageSize){
					botEchartShowData.push(this.botEchartAllData[i]);
				}
			}
			this.botEchartData = botEchartShowData;
			
			
		},
		topEchartCode(newVal,oldVal){ //右上角柱状图获取对应人员需要传的code
			//右上角柱状图加载完成赋值-默认第一个
			//点击右上角柱状图改变该值
			this.getBotEchartData(); //获取右下角柱状图数据
			this.getPeoImgInfo(); //获取照片信息
		},
		send_suo_duan_options(newVal,oldVal){ //切换段还是所执行
			for(let item of this.myMenu_suo_duan_showOptions){ //改左上角名
				if(item.selected){
					this.thePageTit = item.unitName + '质量管理监控平台';
				}
			}
			this.getTopEchartData(); //获取右上角柱状图数据
		},
		imgCarouselTime(newVal,oldVal){ //照片轮播时间变化执行-重置计时器
			clearInterval(this.imgCarInterval); //清除计时器
			//判断轮播时间，值为0是停止
			if(newVal != 0){ //不为0，更新计时器
				this.imgCarInterval = setInterval(this.setPeoImgCarousel,newVal);
			}
		},
		proCarouselTime(newVal,oldVal){ //项目轮播时间变化执行设置
			clearInterval(this.proCarInterval); //清除计时器
			//判断轮播时间，值为0是停止
			if(newVal != 0){ //不为0，更新计时器
				this.proCarInterval = setInterval(this.setPeoProjectCarousel,newVal);
			}
		}
	},
	methods: {
		botEchartPageNext(e){ //右下角柱状图下一页事件
			let newPageNum = this.botEchartDataPageList_pageNum + 1; //下一页的页数
			let page = Math.ceil(this.botEchartAllData.length / this.botEchartDataPageList_pageSize); //总页数
			if(newPageNum <= page){
				this.botEchartDataPageList_pageNum = newPageNum;
			}else{ //当前页是最后一页，从第一页开始
				this.botEchartDataPageList_pageNum = 1;
			}
		},
		botEchartPageListFn(e){ //右下角柱状图页签点击事件
			let clickPageSize = e.currentTarget.dataset.pagesize; //当前点击的页签应显示第几页
			if(clickPageSize == this.botEchartDataPageList_pageNum){ //点击的页签就是当前的展示页
				return false;
			}
			this.botEchartDataPageList_pageNum = clickPageSize;
		},
		showDetailPop(e){ //返修单弹窗展示事件
			//数量为0或undefined
			if(e.currentTarget.dataset.index == 0 || e.currentTarget.dataset.index == undefined){
				return false;
			}
			let unitValue; //判断是段还是所 0-段 1-所
			let unitCode; //运用所编码
			for(let item of this.myMenu_suo_duan_showOptions){
				if(item.selected){
					unitCode = item.unitCode;
					unitValue = item.unitValue;
				}
			}
			if(unitValue == 0){ //段
				unitCode = vue.topEchartCode; //右上角柱状图选中的code
			}
			let sQcCode; //人员code
			for(let father of this.peoImgInfo){
				for(let child of father.group){
					if(child.orChoose){
						sQcCode = child.code;
					}
				}
			}
			let _this = this;
			console.log(e.currentTarget.dataset.sfaultlevel + ',' + sQcCode + ',' + unitCode);
			$.ajax({
				url: request_api + '/rework/getReworkcord',
				data: {
					sFaultLevel: e.currentTarget.dataset.sfaultlevel,
					sQcCode: sQcCode,
					sUnitCode: unitCode,
				},
				type: 'post',
				dataType: 'json',
				success: res => {
					console.log(res);
					let getData = res.zzReworkRecords;
					_this.peoGroupDetailPop = getData; //赋值
					_this.detailPopShow = true; //展示
				},
				error: err => {
					if(err.readyState == 0){
						$.showInforDlg('提示','网络异常，请检查网络！',2);
					}else{
						$.showInforDlg('提示','获取详情失败！',7);
					}
					console.log(err);
				},
				complete: () => {
					
				}
			})
		},
		closeDetailPop(){ //返修单弹窗关闭事件
			this.detailPopShow = false;
		},
		getMyMenu_suo_duan_showOptions(){ //获取自定义右键菜单的所或段的下拉选
			const _this = this;
			$.ajax({
				url: request_api + '/qualityManage/getUnitInfo',
				data: {
					
				},
				type: 'post',
				dataType: 'json',
				success: res => {
					console.log(res);
					let obj = res;
					for(let i=0; i<obj.length; i++){
						if(i==0){
							obj[i].selected = true;
						}else{
							obj[i].selected = false;
						}
					}
					_this.myMenu_suo_duan_showOptions = obj;
					_this.thePageTit = obj[0].unitName + '质量管理监控平台';
				},
				error: err => {
					if(err.readyState == 0){
						$.showInforDlg('提示','网络异常，请检查网络！',2);
					}else{
						$.showInforDlg('提示','获取运用所失败！',7);
					}
					console.log(err);
				},
				complete: () => {
				}
			})
		},
		myMenuSure(e){ //自定义右键菜单确定按钮
			let suo_duan = $('.menu_select option:selected').data('code'); //所段下拉选code
			// let which_suo_duan = $('.menu_select').val(); //所段下拉选-选的是所还是段 1-所 2-段
			let peopleTime = $('.menu_people .menuInp').val() == '暂停' ? 0 : $('.menu_people .menuInp').val(); //职工input
			let projectTime = $('.menu_project .menuInp').val() == '暂停' ? 0 : $('.menu_project .menuInp').val(); //项目input
			//赋值对应下拉选的selected
			let obj = this.myMenu_suo_duan_showOptions;
			for(let item of obj){ //更新选中-selected的值
				item.selected = false;
				if(item.unitCode == suo_duan){
					item.selected = true;
				}
			}
			this.myMenu_suo_duan_showOptions = obj;
			//照片轮播时间赋值
			if(peopleTime !== ''){
				this.imgCarouselTime = peopleTime * 1000;
			}
			//项目轮播时间赋值
			if(projectTime !== ''){
				this.proCarouselTime = projectTime * 1000;
			}
			
			this.myMenuClose();
		},
		myMenuClose(e){ //自定义右键菜单取消按钮
			$('#menu').fadeOut(300, () => {
				$('#menu .menuInp').val(''); //清空input内容
			});
		},
		setTimePause(e){ //自定义右键菜单暂停按钮
			$('.' + e.currentTarget.dataset.which + ' .menuInp').val('暂停');
		},
		setContextmenuInpChange(){ //轮播时间input监控(项目<职工)
			//$('.menu_project .menuInp').bind('input propertychange', e => { //项目监控
			$(document).on('blur','.menu_project .menuInp', e => {
				let projectTime; //项目值 空-当前轮播的值 '暂停'-0
				if($(e.currentTarget).val() === ''){
					projectTime = this.proCarouselTime/1000;
				}else if($(e.currentTarget).val() == '暂停'){
					projectTime = 0;
				}else{
					projectTime = parseInt($(e.currentTarget).val());
				}
				
				let peopleTime; //职工值 空-当前轮播的值 '暂停'-0
				if($('.menu_people .menuInp').val() === ''){
					peopleTime = this.imgCarouselTime/1000;
				}else if($('.menu_people .menuInp').val() == '暂停'){
					peopleTime = 0;
				}else{
					peopleTime = parseInt($('.menu_people .menuInp').val());
				}
				
				if(projectTime > peopleTime && peopleTime !== 0){ //项目>职工-职工=0是暂停-so不限制
					$(e.currentTarget).val(peopleTime) //返回项目的最大值
				}
			});
			
			//$('.menu_people .menuInp').bind('input propertychange', e => { //职工监控
			$(document).on('blur','.menu_people .menuInp', e => {
				let peopleTime; //职工值 空-当前轮播的值 '暂停'-0
				if($(e.currentTarget).val() === ''){
					peopleTime = this.imgCarouselTime/1000;
				}else if($(e.currentTarget).val() == '暂停'){
					peopleTime = 0;
				}else{
					peopleTime = parseInt($(e.currentTarget).val());
				}
				
				let projectTime; //项目值 空-当前轮播的值 '暂停'-0
				if($('.menu_project .menuInp').val() === ''){
					projectTime = this.proCarouselTime/1000;
				}else if($('.menu_project .menuInp').val() == '暂停'){
					projectTime = 0;
				}else{
					projectTime = parseInt($('.menu_project .menuInp').val());
				}
				
				if(peopleTime < projectTime){ //职工<项目
					$(e.currentTarget).val(projectTime) //返回职工的最小值
				}
			});
		},
		getCarouselTimeLocalStorage(){ //获取本地缓存中的轮播时间
			if(!localStorage.getItem('carouselTimeStorage')){ //缓存不存在
				//设置默认缓存
				localStorage.setItem('carouselTimeStorage','{"imgCarouselTime": "60000","proCarouselTime": "20000"}');
			}
			//获取缓存赋值
			let timeStorage = JSON.parse(localStorage.getItem('carouselTimeStorage'));
			this.imgCarouselTime = parseInt(timeStorage.imgCarouselTime);
			this.proCarouselTime = parseInt(timeStorage.proCarouselTime);
		},
		setPeoProjectCarousel() { //设置对应项目轮播属性
			if(this.peoHomologousProject.length > 1){ //有下一页
				$('#peoProjectCarousel').carousel('next'); //下一组
				$('#peoProjectCarousel').carousel('pause'); //停止轮播
			}
		},
		setPeoImgCarousel() { //设置照片信息轮播图下一组判断
		
			let fatherIndex; //接收选中属性对应的下标
			let childIndex;
			for (let i = 0; i < this.peoImgInfo.length; i++) {
				for (let j = 0; j < this.peoImgInfo[i].group.length; j++) {
					if (this.peoImgInfo[i].group[j].orChoose) { //获取选中的对应下标
						fatherIndex = i;
						childIndex = j;
					}
					this.peoImgInfo[i].group[j].orChoose = false; //清空所有选中
				}
			}
			//清空前选中的信息为group的最后一项，父下标+1、子下标重置、执行轮播
			if (childIndex == this.peoImgInfo[fatherIndex].group.length - 1) {
				if (fatherIndex == this.peoImgInfo.length - 1) { //最后一组，重置
					fatherIndex = 0;
				} else { //不是最后一组，++
					fatherIndex++;
				}
				childIndex = 0; //重置子下标
				$('#peoImgCarousel').carousel('next'); //下一组
				$('#peoImgCarousel').carousel('pause'); //停止轮播
			} else { //不是最后一项，子下标+1
				childIndex++;
			}
			this.peoImgInfo[fatherIndex].group[childIndex].orChoose = true;
			//人员每次轮播-
			this.getPeoHomologousProject(); //获取对应人员的项目
		},
		getPeoImgInfo() { //获取照片信息
			const _this = this;
			let unitcode;
			let unittype;
			for(let item of _this.myMenu_suo_duan_showOptions){
				if(item.selected){
					unitcode = item.unitCode;
					unittype = item.unitValue;
				}
			}
			let topEchartCode = _this.topEchartCode;
			console.log(unitcode + ',' + unittype + ',' + topEchartCode)
			$.ajax({
				url: request_api + '/qualityManage/getPeoImgInfo',
				data: {
					unitcode: unitcode,
					unittype: unittype,
					topEchartCode: topEchartCode,
				},
				type: 'post',
				dataType: 'json',
				success: res => {
					console.log(res);
					
					if(res.length != 0){
						for(let father of res){
							for(let child of father.group){
								child.orChoose = false;
							}
						}
						res[0].group[0].orChoose = true; //默认选中第一个
						_this.peoImgInfo = res;
						_this.getPeoHomologousProject(); //获取对应人员的项目(页面加载展示第一个)
						//判断照片轮播时间，值为0是停止
						if(_this.imgCarouselTime != 0){
							clearInterval(_this.imgCarInterval); //清除计时器
							//每隔...秒，设置照片信息轮播图下一组判断
							_this.imgCarInterval = setInterval(_this.setPeoImgCarousel,_this.imgCarouselTime);
						}
					}else{
						_this.peoImgInfo = []; //为空，清除轮播计时器
						clearInterval(_this.imgCarInterval); //清除计时器
						_this.peoHomologousProject = []; //清除对应项目数据
					}
				},
				error: err => {
					if(err.readyState == 0){
						$.showInforDlg('提示','网络异常，请检查网络！',2);
					}else{
						$.showInforDlg('提示','获取照片列表失败！',7);
					}
					console.log(err);
				},
				complete: () => {
				}
			})
		},
		getBotEchartData() { //获取右下角柱状图数据
			const _this = this;
			let unitcode;
			let unittype;
			for(let item of _this.myMenu_suo_duan_showOptions){
				if(item.selected){
					unitcode = item.unitCode;
					unittype = item.unitValue;
				}
			}
			let topEchartCode = _this.topEchartCode;
			console.log(unitcode + ',' + unittype + ',' + topEchartCode)
			$.ajax({
				url: request_api +  '/qualityManage/getBotEchartData',
				data: {
					unitcode: unitcode,
					unittype: unittype,
					topEchartCode: topEchartCode,
				},
				type: 'post',
				dataType: 'json',
				success: res => {
					console.log(res);
					_this.botEchartDataPageList_pageNum = 1; //默认展示第一页
					if(res.length != 0){
						_this.botEchartAllData = res; //存储所有数据
					}else{
						_this.botEchartData = []; //无数据-展示数据为空
					}
				},
				error: err => {
					if(err.readyState == 0){
						$.showInforDlg('提示','网络异常，请检查网络！',2);
					}else{
						$.showInforDlg('提示','获取质检员平均分失败！',7);
					}
					console.log(err);
				},
				complete: () => {
				}
			})
		},
		getTopEchartData() { //获取右上角柱状图数据
			const _this = this;
			let unittype;
			let unitcode;
			for(let item of _this.myMenu_suo_duan_showOptions){
				if(item.selected){
					unittype = item.unitValue;
					unitcode = item.unitCode;
				}
			}
			console.log(unittype + ',' + unitcode)
			$.ajax({
				url: request_api + '/qualityManage/getTopEchartData',
				data: {
					unittype: unittype,
					unitcode: unitcode,
				},
				type: 'post',
				dataType: 'json',
				success: res => {
					console.log(res);
					_this.topEchartData = res;
					_this.getTopEc(); //设置右上角柱状图
				},
				error: err => {
					if(err.readyState == 0){
						$.showInforDlg('提示','网络异常，请检查网络！',2);
					}else{
						$.showInforDlg('提示','获取质检组图表失败！',7);
					}
					console.log(err);
				},
				complete: () => {
				}
			})
		},
		getPeoHomologousProject() { //获取对应人员的项目
			const _this = this;
			let qcstuffcode;
			let deptcode;
			for(let father of this.peoImgInfo){ //遍历获取选中图片对应code
				for(let item of father.group){
					if(item.orChoose){
						qcstuffcode = item.code;
						deptcode = item.deptCode;
					}
				}
			}
			console.log(qcstuffcode + ',' + deptcode)
			$.ajax({
				url: request_api + '/qualityManage/getPeoHomologousProject',
				data: {
					qcstuffcode: qcstuffcode,
					deptcode: deptcode,
				},
				type: 'post',
				dataType: 'json',
				success: res => {
					console.log(res);
					if(res.length != 0){
						_this.peoHomologousProject = res;
						
						//bug：项目数据发生变化时，轮播显示的第三组，新数据只有两组，导致页面展示为空
						//so：每次项目数据发生变化，将轮播设置展示第一组
						$('#peoProjectCarousel .carousel-inner .item').each((i,e) => {
							if(i == 0){
								$(e).addClass('active');
							}else{
								$(e).removeClass('active');
							}
						})
						
						//判断项目轮播时间，值为0是停止
						if(_this.proCarouselTime != 0){
							clearInterval(_this.proCarInterval); //清除计时器
							//每隔...秒，设置项目信息轮播图下一组判断
							_this.proCarInterval = setInterval(_this.setPeoProjectCarousel,_this.proCarouselTime);
						}
					}else{
						_this.peoHomologousProject = []; //为空，清除轮播计时器
						clearInterval(_this.proCarInterval); //清除计时器
					}
				},
				error: err => {
					if(err.readyState == 0){
						$.showInforDlg('提示','网络异常，请检查网络！',2);
					}else{
						$.showInforDlg('提示','获取职工对应项目失败！',7);
					}
					console.log(err);
				},
				complete: () => {
				}
			})
		},
		peoImgClick(e) { //照片点击事件
			let index = e.currentTarget.dataset.index;
			let fatherIndex = e.currentTarget.dataset.fatherindex;
			for (let father of this.peoImgInfo) { //清空所有选中
				for (let item of father.group) {
					item.orChoose = false;
				}
			}
			this.peoImgInfo[fatherIndex].group[index].orChoose = true; //设置点击的下标设置选中
			this.getPeoHomologousProject(); //获取对应人员的项目
		},
		getThisDate() { //动态时间
			let thisDate = new Date();
			let y = thisDate.getFullYear();
			let m = thisDate.getMonth() + 1 > 9 ? thisDate.getMonth() + 1 : '0' + (thisDate.getMonth() + 1);
			let d = thisDate.getDate() > 9 ? thisDate.getDate() : '0' + thisDate.getDate();
			let h = thisDate.getHours() > 9 ? thisDate.getHours() : '0' + thisDate.getHours();
			let mi = thisDate.getMinutes() > 9 ? thisDate.getMinutes() : '0' + thisDate.getMinutes();
			let s = thisDate.getSeconds() > 9 ? thisDate.getSeconds() : '0' + thisDate.getSeconds();
			thisDate = y + '年' + m + '月' + d + '日 ' + h + ':' + mi + ':' + s;
			this.dynamicTime = thisDate;
			
			setTimeout(this.getThisDate, 1000);
		},
		getBotEc() { //设置右下角柱状图
			let botEc = echarts.init(document.getElementById('remaRightEcId'));
			let nameData = []; //柱状图的名数组
			let scoreData = []; //柱状图的分数数组
			// for (let item of this.botEchartData) {
			// 	nameData.push(item.name);
			// 	scoreData.push(item.score);
			// }
			//倒着遍历-因为正常显示第一条在最下面，需要第一条在最上面
			for (let i=this.botEchartData.length-1; i>=0; i--) {
				let item = this.botEchartData[i];
				nameData.push(item.name);
				scoreData.push(item.score);
			}
			options = {
				color: ['#3398db'],
				tooltip: {
					trigger: 'axis',
					axisPointer: { // 坐标轴指示器，坐标轴触发有效
						type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
					}
				},
				grid: {
					left: '3%',
					right: '4%',
					bottom: '3%',
					containLabel: true
				},
				yAxis: [ //x轴坐标xAxis的字体颜色大小，坐标线颜色，以及网格线的设置
					{

						type: 'category',
						data: nameData,
						axisTick: {
							alignWithLabel: true
						},
						axisLine: {
							lineStyle: {
								type: 'solid',
								color: '#014085', //左边线的颜色
								width: '1' //坐标线的宽度
							}
						},
						axisLabel: {
							textStyle: {
								color: '#4bb4d2', //坐标值得具体的颜色
								fontSize: 13
							}
						}
					}
				],
				// dataZoom: [{
				// 	type: 'slider',
				// 	show: true,
				// 	yAxisIndex: [0],
				// 	width: 8,
				// 	right: '1',
				// 	bottom: '10%',
				// 	start: 0,
				// 	end: 70 ,//初始化滚动条
				// 	// backgroundColor: 'transparent',//两边未选中的滑动条区域的颜色
				// 	// borderColor: "transparent",
				// }],
				xAxis: [ //y轴坐标xAxis的字体颜色大小，坐标线颜色，以及网格线的设置
					{
						show: true,
						type: 'value',
						min: 0,
						max: vue.botEchartAllData[0].score, //降序的，所以第一个的score是最大的
						axisLine: {
							show: false,
							lineStyle: {
								type: 'solid',
								color: '#4bb4d2', //左边线的颜色
								width: '1' //坐标线的宽度
							}
						},
						axisTick: {
							alignWithLabel: true
						},
						axisLabel: {
							show: true
						},
						splitLine: { //网格样式
							show: true,
							lineStyle: {
								color: ['#014085'],
								width: 1,
								type: 'solid'
							}
						}
					}
				],
				series: [{
					//name: 'XXXXXXX',
					type: 'bar',
					barWidth: '30',
					itemStyle: {
						normal: {
							//barBorderRadius: [0, 5, 5, 0],
							label: {
								show: false, //开启显示
								position: 'right', //在上方显示
								textStyle: { //数值样式
									color: '#fff',
									fontSize: 16
								}
							}
						}
					},
					data: scoreData,

				}],
			};

			botEc.setOption(options);
		},
		getTopEc() { //设置右上角柱状图
			let topEc = echarts.init(document.getElementById('topEcId'));
			let nameData = []; //柱状图的名数组
			let scoreData = []; //柱状图的分数数组
			for (let item of this.topEchartData) {
				nameData.push(item.name);
				scoreData.push(item.score);
			}
			let curInt;
			option = {
				color: ['#3398db'],
				tooltip: {
					trigger: 'axis',
					axisPointer: { // 坐标轴指示器，坐标轴触发有效
						type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
					}
				},
				grid: {
					left: '3%',
					right: '4%',
					bottom: '3%',
					containLabel: true
				},
				xAxis: [ //x轴坐标xAxis的字体颜色大小，坐标线颜色，以及网格线的设置
					{
						type: 'category',
						data: nameData,
						axisTick: {
							alignWithLabel: true
						},
						axisLine: {
							show: false,
							lineStyle: {
								type: 'solid',
								color: '#fff', //左边线的颜色
								width: '1' //坐标线的宽度
							}
						},
						axisLabel: {
							textStyle: {
								color: '#4bb4d2', //坐标值得具体的颜色
								fontSize: 13
							}
						}
					}
				],
				
				yAxis: [ //y轴坐标xAxis的字体颜色大小，坐标线颜色，以及网格线的设置
					{
						type: 'value',
						axisLine: {
							show: false,
							lineStyle: {
								type: 'solid',
								color: '#4bb4d2', //左边线的颜色
								width: '1' //坐标线的宽度
							}
						},
						splitLine: { //网格样式
							show: true,
							lineStyle: {
								color: ['#014085'],
								width: 1,
								type: 'solid'
							}
						}
					}
				],
				series: [{
					//name: 'XXXXXXX',
					type: 'bar',
					barWidth: '30',
					data: scoreData,
					itemStyle:{
						normal:{
							//barBorderRadius: [5, 5, 0, 0],
							color: function(params) {
                                var key = params.dataIndex;
                                if(key  == curInt){
                                    return "#01f0ff";
                                }else{
                                    return "#3398db";
                                }
                            },
							// shadowBlur: 20,
							// shadowColor: 'rgb(32, 79, 142)',
							// shadowOffsetX: 0,
							// shadowOffsetY: 0,
						}
					}
				}],
			};

			topEc.setOption(option);
			
			topEc.getZr().on('click', params => { //图形区域的点击事件
				const pointlnPixel = [params.offsetX, params.offsetY]; //点击的坐标
				if(topEc.containPixel('grid', pointlnPixel)){ //判断点击的坐标是否在图形区域
					curInt = topEc.convertFromPixel({seriesIndex: 0}, pointlnPixel)[0]; //下标
					topEc.setOption(option)
					vue.topEchartCode = vue.topEchartData[curInt].code; //点击下标的code
				}
			});

			// topEc.on('click', function (params) {
			// 	//console.log(params)
			// 	curInt = params.dataIndex;
			// 	topEc.setOption(option)
			// 	
			// 	vue.topEchartCode = vue.topEchartData[curInt].code; //点击下标的code
			// });
			
			//默认第一个
			curInt = 0;
			topEc.setOption(option);
			//右上角柱状图无数据导致没有.code - 如果不赋值会导致关联的数据不更新
			//so随便传个参数-更新后面关联的数据(空)
			vue.topEchartCode = vue.topEchartData.length > 0 ? vue.topEchartData[0].code : '~!@#$';
			
		},
	},
})

window.oncontextmenu = e => { //自定义右键菜单
	//鼠标右键的坐标
	let wx = e.clientX;
	let wy = e.clientY;
	//取消默认事件
	e.preventDefault();
	//获取自定义的右键菜单
	let menu = document.querySelector("#menu");
	//根据鼠标点击的位置，进行定位
	menu.style.left = wx + 'px';
	menu.style.top = wy + 'px';
	//展示菜单
	$(menu).fadeIn(300);
}
window.onclick = e => { //关闭右键自定义菜单
	//console.log(e)
	//鼠标点击的坐标
	let wx = e.clientX;
	let wy = e.clientY;
	if(wx == 0 && wy == 0){ //选中下拉选，是0,0
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
		vue.myMenuClose(); //菜单取消按钮事件
	}
}

// window.oncontextmenu =  e => { //自定义右键菜单
// 	$('.menuInp').val(''); //清空输入框
// 	//每次右键先隐藏自定义菜单
// 	$('#menu').hide();
// 	$('#menuPro').hide();
// 	//鼠标右键的坐标
// 	var wx = e.clientX;
// 	var wy = e.clientY;
// 
// 	//右键位置在照片信息div内
// 	var d_left = document.getElementById('peoImgCarousel').offsetLeft;
// 	var d_top = document.getElementById('peoImgCarousel').offsetTop;
// 	var d_width = document.getElementById('peoImgCarousel').clientWidth;
// 	var d_height = document.getElementById('peoImgCarousel').clientHeight;
// 	if (!(wx < d_left || wy < d_top || wx > (d_left + d_width) || wy > (d_top + d_height))){
// 		//取消默认事件
// 		e.preventDefault();
// 		//获取自定义的右键菜单
// 		var menu = document.querySelector("#menu");
// 		//根据鼠标点击的位置，进行定位
// 		menu.style.left = wx + 'px';
// 		menu.style.top = wy + 'px';
// 		//展示菜单
// 		//menu.style.display = 'block';
// 		$(menu).show(300);
// 	}
// 
// 	//右键位置在项目信息div内
// 	var p_left = document.getElementById('peoProjectCarousel').offsetLeft;
// 	var p_top = document.getElementById('peoProjectCarousel').offsetTop;
// 	var p_width = document.getElementById('peoProjectCarousel').clientWidth;
// 	var p_height = document.getElementById('peoProjectCarousel').clientHeight;
// 	if (!(wx < p_left || wy < p_top || wx > (p_left + p_width) || wy > (p_top + p_height))){
// 		//取消默认事件
// 		e.preventDefault();
// 		//获取自定义的右键菜单
// 		var menu = document.querySelector("#menuPro");
// 		//根据鼠标点击的位置，进行定位
// 		menu.style.left = wx + 'px';
// 		menu.style.top = wy + 'px';
// 		//展示菜单
// 		//menu.style.display = 'block';
// 		$(menu).show(300);
// 	}
// 
// }
// 
// window.onclick =  e => { //关闭右键自定义菜单
// 	$('.menuInp').val(''); //清空输入框
// 	//鼠标点击的坐标
// 	var wx = e.clientX;
// 	var wy = e.clientY;
// 	//判断点击事件是否在自定义菜单内
// 	var menuEle = document.getElementById('menu'); //照片菜单节点
// 	var proMenuEle = document.getElementById('menuPro'); //项目菜单节点
// 	//获取展示的自定义菜单坐标范围
// 	var d_left = menuEle.offsetLeft==0 ? proMenuEle.offsetLeft : menuEle.offsetLeft;
// 	var d_top = menuEle.offsetTop==0 ? proMenuEle.offsetTop : menuEle.offsetTop;
// 	var d_width = menuEle.clientWidth==0 ? proMenuEle.clientWidth : menuEle.clientWidth;
// 	var d_height = menuEle.clientHeight==0 ? proMenuEle.clientHeight : menuEle.clientHeight;
// 	if (!(wx < d_left || wy < d_top || wx > (d_left + d_width) || wy > (d_top + d_height))){
// 		//取消默认事件
// 		e.preventDefault();
// 	}else{
// 		$('#menu').hide(300);
// 		$('#menuPro').hide(300);
// 	}
// 	
// }

window.onbeforeunload = function(event) { //窗口关闭前执行
	let thisCarouselTimeJson = { //获取当前轮播时间
		imgCarouselTime: vue.imgCarouselTime,
		proCarouselTime: vue.proCarouselTime
	}
	//更新轮播时间缓存
	localStorage.setItem('carouselTimeStorage',JSON.stringify(thisCarouselTimeJson))
}
