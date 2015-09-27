function Events(){
	function insert(event, cb){
		var q_ins = '',
			placeholders = [],
			_fields = [
				CONTRACT.DB.FIELDS.EVENTS._ID,
				CONTRACT.DB.FIELDS.EVENTS.BEGIN_TIME,
				CONTRACT.DB.FIELDS.EVENTS.CREATED_AT,
				CONTRACT.DB.FIELDS.EVENTS.DESCRIPTION,
				CONTRACT.DB.FIELDS.EVENTS.DETAIL_INFO_URL,
				CONTRACT.DB.FIELDS.EVENTS.END_DATE,
				CONTRACT.DB.FIELDS.EVENTS.END_TIME,
				CONTRACT.DB.FIELDS.EVENTS.IMAGE_HORIZONTAL_URL,
				CONTRACT.DB.FIELDS.EVENTS.IMAGE_VERTICAL_URL,
				CONTRACT.DB.FIELDS.EVENTS.LATITUDE,
				CONTRACT.DB.FIELDS.EVENTS.LONGITUDE,
				CONTRACT.DB.FIELDS.EVENTS.LOCATION_JSON,
				CONTRACT.DB.FIELDS.EVENTS.LOCATION_TEXT,
				CONTRACT.DB.FIELDS.EVENTS.LOCATION_URI,
				CONTRACT.DB.FIELDS.EVENTS.NOTIFICATIONS,
				CONTRACT.DB.FIELDS.EVENTS.ORGANIZATION_ID,
				CONTRACT.DB.FIELDS.EVENTS.START_DATE,
				CONTRACT.DB.FIELDS.EVENTS.TITLE,
				CONTRACT.DB.FIELDS.EVENTS.UPDATED_AT];
		_fields.forEach(function(){
			placeholders.push('?');
		});
		q_ins = 'REPLACE INTO ' + CONTRACT.DB.TABLES.EVENTS + ' (' +
			_fields.join(',') + ') ' +
			' VALUES ( ' + placeholders.join(', ') + ');';

		__db.transaction(function(tx) {
			tx.executeSql(q_ins, [
				event.id,
				event.begin_time,
				moment().unix(),
				event.description,
				event.detail_info_url,
				event.timestamp_event_end_date,
				event.end_time,
				event.image_horizontal_url,
				event.image_vertical_url,
				event.latitude,
				event.longitude,
				event.location_object,
				event.location,
				event.location_uri,
				event.notifications_schema_json,
				event.organization_id,
				event.timestamp_event_start_date,
				event.title,
				moment().unix()
			], function(tx, res){
				event.tags.forEach(function(tag){
					__api.tags.post(tag, function(tag_res){
						__api.event_tags.post({
							event_id: res.insertId,
							tag_id: tag_res.insertId
						}, function(){});
					});
				});
				event.favorite_friends.forEach(function(user){
					__api.users.post(user, function(user_res){
					});
				});
				cb(res);
			},function(tx, err){
				L.log(tx, err);
				cb(null);
			})
		})

	}



	function normalize(items){
		if (!items) return items;
		var _items = [];
		items.forEach(function(event){
			event.tags_array = [];
			event.tags.forEach(function(tag){
				event.tags_array.push(tag.name);
			});

			var st_date = moment(event.event_start_date),
				end_date = moment(event.event_end_date);

			event.date =  moment(event.event_start_date).format(CONTRACT.DATE_FORMAT);
			event.begin_time = moment(event.begin_time, 'HH:mm:ss').format('HH:mm');
			event.end_time = moment(event.end_time, 'HH:mm:ss').format('HH:mm');
			event.time = event.begin_time == '00:00' && event.end_time == '00:00' ? ' Весь день': event.begin_time + ' - ' + event.end_time;
			event.dates = end_date.format('DD MMMM') ;
			event.short_dates = end_date.format('DD/MM') ;
			event.day_name = end_date.format('dddd');
			if (end_date.format(CONTRACT.DATE_FORMAT) != st_date.format(CONTRACT.DATE_FORMAT)){
				event.one_day = false;
				if (end_date.format('MM') == st_date.format('MM')){
					event.dates = st_date.format('DD') + ' - ' + end_date.format('DD MMMM');
				}else{
					event.dates = st_date.format('DD MMMM') + ' - ' + end_date.format('DD MMMM')
				}
				event.short_dates = st_date.format('DD/MM') + ' - ' + end_date.format('DD/MM')
			}else{
				event.one_day = true;
			}
			event.tags_text = event.tags_array.join(', ');

			_items.push(event);
		});
		return _items;
	}

	function getOffline(filters, cb){
		var _f = prepareFilterQuery(filters),
			q_get_items = 'SELECT * FROM ' + CONTRACT.DB.TABLES.EVENTS +
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
						_r = normalize(res.data);
						cb(_r);
						if (_f.data.hasOwnProperty('type') && _f.data.type == 'short'){
							//TODO: save short events?
						}else{
							_post(res.data, function(){});
						}

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
				insert(data);
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