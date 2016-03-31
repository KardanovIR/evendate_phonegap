function FavoriteEvents(){

	return {
		'get': function(filters, cb){
			var _f = prepareFilterQuery(filters);
			$$.ajax({
				url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH + CONTRACT.URLS.FAVORITES_PART,
				data: _f.data,
				success: cb
			});
		}
	}
}