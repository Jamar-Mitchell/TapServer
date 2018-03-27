var mongoose = require('mongoose'),
	Schema = mongoose.Schema,

	Attendance = new Schema({
		number: {
			type: Number,
			unique: true,
			required: true
        },
        attendanceCount:{
        type:Number,
        default: 0,
        required:true
      },
		user:[{
        type: Schema.Types.ObjectId,
        ref: 'User'
         }]

	    });

module.exports = mongoose.model('Attendance', Attendance);
