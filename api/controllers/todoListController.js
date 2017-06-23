'use strict';

var mongoose = require('mongoose');
var Task = mongoose.model('Tasks');

exports.list_all_tasks = function(req,res){
	Task.find({},function(err,task){
		if (err){
			res.send(err);
		}
		res.json(task);
	});
};

exports.create_a_task = function(req,res) {
	var new_task = new Task(req.body);
	new_task.save(function(err,task){
		if (err){
			res.send(err);
		}
		res.json(task);
	});
};

exports.read_a_task = function(req,res) {
	Task.findById(req.params.taksId,function(err,task){
		if (err){
			res.send(err);
		}
		res.json(task);
	});
};

exports.update_a_task = function(req,res) {
	Task.findOneAndUpdate(req.params.taksId,req.body,{new:true},function(err,task){
		if (err)
			res.send(err);
		res.json(task);
	});
};

exports.delete_a_task = function(req,res) {
	Task.remove({_id:req.params.taksId},function(err,task){
		if (err)
			res.send(err);
		res.json(task);
	});
};



