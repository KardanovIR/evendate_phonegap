
function Subscriptions(){


	return {
		'get': function(filters, cb){
			if (!Array.isArray[filters]){
				filters = []
			}
			filters = filters.concat([
				{subscription_id: 'NOT NULL'}
			]);
			__api.organizations.get(filters, cb);

		},
		'post': function(data){
			if (!data) throw Error('Data is empty');
			__api.organizations.post(data);
		},
		refresh: function(cb){
			return $$.ajax({
				url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.SUBSCRIPTIONS_PATH + CONTRACT.URLS.MY_PART,
				dataType: 'JSON',
				success: function(res){
					res = JSON.parse(res);
					debugger;
					if (cb instanceof Function){
						cb(res.data);
					}
				}
			});
		}
	}
}