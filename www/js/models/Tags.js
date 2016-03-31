function Tags(){

	return {
		'get': function(filters, cb){
			var _f = prepareFilterQuery(filters);
			$$.ajax({
				url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH,
				data: _f.data,
				success: function(res){
					cb(res.data);
				}
			});
		}
	}
}