
function Subscriptions(){


	return {
		'get': function(filters, cb){
			if (!Array.isArray[filters]){
				filters = []
			}
			filters = filters.concat([
				{is_subscribed: true},
				{page: 0},
				{length: 500}
			], filters);
			__api.organizations.get(filters, cb);

		},
		'post': function(){}
	}
}