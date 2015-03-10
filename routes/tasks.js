
/*
 * GET users listing.
 */
var spawn = require('child_process').spawn;
var result = '20';
exports.list = function(req, res, next){
  req.db.tasks.find({completed: false}).toArray(function(error, tasks){
    if (error) return next(error);
    res.render('tasks', {
      title: 'Todo List',
      tasks: tasks || []
    });
  });
};

exports.add = function(req, res, next){
  var options = {
      cwd:"/Users/qianjizheng/Documents/Projects/LEDParser"
     };
  var expression = req.body.name;
   console.info('expression=%s', expression);

  result = '';
  var child = spawn('python3.4', ['server.py', expression],options);
  child.stdout.on('data',function(data){
    result += data;
    req.db.tasks.save({
    name: expression + '='+data,
    //name: result,
    createTime: new Date(),
    completed: false
  }, function(error, task){
    if (error) return next(error);
    if (!task) return next(new Error('Failed to save.'));

    console.info('Added %s with id=%s', task.name, task._id);
    console.info('%s=%s', expression,result);
    res.redirect('/tasks');
  })

  });
  
};

exports.markAllCompleted = function(req, res, next) {
  if (!req.body.all_done || req.body.all_done !== 'true') return next();
  req.db.tasks.update({
    completed: false
  }, {$set: {
    completeTime: new Date(),
    completed: true
  }}, {multi: true}, function(error, count){
    if (error) return next(error);
    console.info('Marked %s task(s) completed.', count);
    res.redirect('/tasks');
  })
};

exports.completed = function(req, res, next) {
  req.db.tasks.find({completed: true}).toArray(function(error, tasks) {
    res.render('tasks_completed', {
      title: 'Completed',
      tasks: tasks || []
    });
  });
};

exports.markCompleted = function(req, res, next) {
  if (!req.body.completed) return next(new Error('Param is missing.'));
  var completed = req.body.completed === 'true';
  req.db.tasks.updateById(req.task._id, {$set: {completeTime: completed ? new Date() : null, completed: completed}}, function(error, count) {
    if (error) return next(error);
    if (count !==1) return next(new Error('Something went wrong.'));
    console.info('Marked task %s with id=%s completed.', req.task.name, req.task._id);
    res.redirect('/tasks');
  })
};

exports.del = function(req, res, next) {
  req.db.tasks.removeById(req.task._id, function(error, count) {
    if (error) return next(error);
    if (count !==1) return next(new Error('Something went wrong.'));
    console.info('Deleted task %s with id=%s completed.', req.task.name, req.task._id);
    res.status(204).send();
  });
};
