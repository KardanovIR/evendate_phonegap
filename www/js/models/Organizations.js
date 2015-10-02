

function Organizations(){
	function insert(organization, cb){
		var q_ins = '',
			_fields = [
				CONTRACT.DB.FIELDS.ORGANIZATIONS._ID,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.BACKGROUND_IMG_URL,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.SUBSCRIBED_COUNT,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.CREATED_AT,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.DESCRIPTION,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.IMG_URL,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.NAME,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.SHORT_NAME,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.SUBSCRIPTION_ID,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.TYPE_ID,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.TYPE_NAME,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.UPDATED_AT];
		q_ins = 'INSERT INTO ' + CONTRACT.DB.TABLES.ORGANIZATIONS + ' (' +
			_fields.join(',') + ') ' +
			' VALUES ( ' + ['?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?'].join(',') + ');';
		__db.transaction(function(tx) {
			tx.executeSql(q_ins, [
				organization.id,
				organization.background_img_url,
				organization.subscribed_count,
				moment().unix(),
				organization.description,
				organization.img_url,
				organization.name,
				organization.short_name,
				organization.subscription_id ? organization.subscription_id : null,
				organization.type_id,
				organization.type_name,
				moment().unix()
			], function(tx, res){
				cb(res);
				if (organization.hasOwnProperty('subscribed_friends')){
					debugger;
					organization.subscribed_friends.forEach(function(user){
						__api.users.post(user, function(res){
							__api.organizations_users.post({
								user_id: res.insertId,
								organization_id: organization.id
							}, function(){})
						})
					});
				}
			},function(tx, err){
				L.log(tx, err);
				cb(null);
			})
		})

	}

	function normalize(items){

		return items;
	}

	function filterData(filters, data){

		return data;
	}

	function getOffline(filters, cb){
		var _f = prepareFilterQuery(filters),
			q_get_items = 'SELECT * FROM ' + CONTRACT.DB.TABLES.ORGANIZATIONS +
				' ' + _f.query;

		__db.transaction(function(tx) {
			tx.executeSql(q_get_items, _f.args, function(tx, res){
				cb(res.rows);
			})
		})
	}

	return {
		'get': function(filters, cb){
			var _post = this.post,
				_r,
				_filters_data = prepareFilterQuery(filters).data,
				url = CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.ORGANIZATIONS_PATH;

			if (_filters_data.hasOwnProperty('id')){
				url += '/' + _filters_data.id;
			}

			if (isOnline()){
				$$.ajax({
					url: url,
					data: angular.extend({
						with_subscriptions: true
					}, _filters_data),
					success: function(res){
						_r = filterData(filters, res.data);
						_r = normalize(_r);
						console.log(_r);
						cb(_r);
						_post(res.data, function(){});
					},
					error: function(err){
						L.log(err);
						getOffline(filters, cb);
					}
				});
			}else{
				getOffline(filters, cb);
			}
		},
		'post': function(data, cb){
			if (!data) throw Error('Data is empty');
			if (!Array.isArray(data)){
				insert(data, cb);
			}else{
				var to_insert = data.length,
					done = 0;
				data.forEach(function(organization){
					insert(organization, function(){
						done++;
						if (done == to_insert){
							cb();
						}
					});
				});
			}
		}
	}
}