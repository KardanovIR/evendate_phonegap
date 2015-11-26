function EventDates(){
	function insert(event, cb){
		var q_ins = '',
			placeholders = [],
			_fields = [
				CONTRACT.DB.FIELDS.EVENTS_DATES.EVENT_ID,
				CONTRACT.DB.FIELDS.EVENTS_DATES.EVENT_DATE,
				CONTRACT.DB.FIELDS.EVENTS_TAGS.CREATED_AT,
				CONTRACT.DB.FIELDS.EVENTS_TAGS.UPDATED_AT
			];
		_fields.forEach(function(){
			placeholders.push('?');
		});
		q_ins = 'INSERT INTO ' + CONTRACT.DB.TABLES.EVENTS_DATES + ' (' +
			_fields.join(',') + ') ' +
			' VALUES ( ' + placeholders.join(', ') + ');';

		__db.transaction(function(tx) {
			tx.executeSql(q_ins, [
				event.event_id,
				event.tag_id,
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
			q_get_items = 'SELECT * FROM ' + CONTRACT.DB.TABLES.TAGS +
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
				data.forEach(function(event){
					insert(event, function(){
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