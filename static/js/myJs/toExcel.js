
function tableToExcel(tableData, tableStyle){ //参数：table内容，样式（样式要在head里）
	//Worksheet名
	let worksheet = 'sheet1'
	let uri = 'data:application/vnd.ms-excel;base64,';

	//下载的表格模板数据
	let template = '';
	template += '<html xmlns:o="urn:schemas-microsoft-com:office:office" ';
	template += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
	template += 'xmlns="http://www.w3.org/TR/REC-html40">';
	template += '<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';
	template += '<x:Name>' + worksheet + '</x:Name>';
	template += '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>';
	template += '</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
	template += tableStyle; //表格样式
	template += '</head><body>' + tableData + '</body></html>';
	//下载模板
	window.location.href = uri + base64(template)
}
//输出base64编码
function base64(s){
	return window.btoa(unescape(encodeURIComponent(s)));
}
	
	