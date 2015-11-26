function OrganizationsUsers(){
	function insert(data, cb){
		var q_ins = '',
			placeholders = [],
			_fields = [
				CONTRACT.DB.FIELDS.ORGANIZATIONS_USERS.ORGANIZATION_ID,
				CONTRACT.DB.FIELDS.ORGANIZATIONS_USERS.USER_ID,
				CONTRACT.DB.FIELDS.EVENTS_TAGS.CREATED_AT,
				CONTRACT.DB.FIELDS.EVENTS_TAGS.UPDATED_AT
			];
		_fields.forEach(function(){
			placeholders.push('?');
		});
		q_ins = 'REPLACE INTO ' + CONTRACT.DB.TABLES.ORGANIZATIONS_USERS + ' (' +
			_fields.join(',') + ') ' +
			' VALUES ( ' + placeholders.join(', ') + ');';

		__db.transaction(function(tx) {
			tx.executeSql(q_ins, [
				data.organization_id,
				data.user_id,
				moment().unix(),
				moment().unix()
			], function(tx, res){
				cb(res);
			},function(tx, err){
				//L.log(tx, err);
				cb(null);
			})
		})

	}

	function getOffline(filters, cb){
		var _f = prepareFilterQuery(filters),
			q_get_items = 'SELECT * FROM ' + CONTRACT.DB.TABLES.ORGANIZATIONS_USERS +
				' ' + _f.query;
		__db.transaction(function(tx) {
			tx.executeSql(q_get_items, _f.args, function(tx, res){
				cb(res.rows);
			})
		})
	}

	return {
		'post': function(data, cb){
			if (!data) throw Error('Data is empty');
			if (!Array.isArray(data)){
				insert(data, cb);
			}else{
				var to_insert = data.length,
					done = 0;
				data.forEach(function(_data){
					insert(_data, function(){
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