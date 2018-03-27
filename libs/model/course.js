var mongoose = require('mongoose'),
	Schema = mongoose.Schema,

	Course = new Schema({
        code: {
			type: String,
			unique: true,
			required: true
        },
		name: {
			type: String,
			unique: true,
			required: true
        },
        attendanceNum:{
        type:Number,
        default: 0,
        required:true
    },
		attendance:[{
        type: Schema.Types.ObjectId,
        ref: 'Attendance'
         }]

	    });

module.exports = mongoose.model('Course', Course);
