function Tags(){
	function insert(tag, cb){
		var q_ins = '',
			placeholders = [],
			_fields = [
				CONTRACT.DB.FIELDS.TAGS._ID,
				CONTRACT.DB.FIELDS.TAGS.NAME,
				CONTRACT.DB.FIELDS.TAGS.CREATED_AT,
				CONTRACT.DB.FIELDS.TAGS.UPDATED_AT
			];
		_fields.forEach(function(){
			placeholders.push('?');
		});
		q_ins = 'REPLACE INTO ' + CONTRACT.DB.TABLES.TAGS + ' (' +
			_fields.join(',') + ') ' +
			' VALUES ( ' + placeholders.join(', ') + ');';

		__db.transaction(function(tx) {
			tx.executeSql(q_ins, [
				tag.id,
				tag.name,
				moment().unix(),
				moment().unix()
			], function(tx, res){
				cb(res);
			},function(tx, err){
				L.log(tx, err);
				cb(null);
			})
		});

	}

	function getOffline(filters, cb){
		var _f = prepareFilterQuery(filters),
			q_get_items = 'SELECT * FROM ' + CONTRACT.DB.TABLES.TAGS +
				' ' + _f.query;
		__db.transaction(function(tx) {
			tx.executeSql(q_get_items, _f.args, function(tx, res){
				cb(res.rows);
			})
		})
	}

	return {
		'get': function(filters, cb){
			var _f = prepareFilterQuery(filters),
				_post = this.post,
				_r;
			if (isOnline()){
				$$.ajax({
					url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH,
					data: _f.data,
					success: function(res){
						cb(_r);
						_post(res.data, function(){});
					},
					error: function(err){
						L.log(err);
						getOffline(filters, cb);
					}
				});
			}else{
				getOffline(cb);
			}
		},
		'post': function(data, cb){
			if (!data) throw Error('Data is empty');
			if (!Array.isArray(data)){
				insert(data, cb);
			}else{
				var to_insert = data.length,
					done = 0;
				data.forEach(function(tag){
					insert(tag, function(){
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