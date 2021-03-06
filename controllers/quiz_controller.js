var models = require('../models/models.js');

exports.load = function(req, res, next, quizId){

	models.Quiz.find({
    where: {
         id: Number(quizId)
          },
         include: [{
         model: models.Comment
         }]
  }).then(function(quiz) {
		if(quiz){
		req.quiz = quiz;
		next();
	      }else{next(new Error('no existe id- '+quizId))}
	    }
	).catch(function(error){next(error)});
};
		

exports.index = function(req, res){
	var search =req.query && req.query.search ? req.query.search: '';
	var busca = { where: { pregunta:{
		     like: '%'+(search.length>0 ? search.replace(/\ /g, "%")+'%' : '')
	        }},
	        order: [['pregunta', 'ASC']]

	};
	if(search.length>0){
		search = 'relacionado con su busqueda: "'+search+'"';
		          }
		models.Quiz.findAll(busca).then(function(quizes){
			res.render('quizes/index.ejs', {quizes: quizes,
			                                search: search,
			                                errors: []
			                             });
	
	}).catch(function(error){next(error)});
};

exports.show = function(req, res){
	
		res.render('quizes/show', {quiz: req.quiz, errors: []});
	
};
exports.answer = function(req, res){
	var resultado ='Incorrecto';
	    if(req.query.respuesta === req.quiz.respuesta){
	    	resultado = 'Correcto';
	}
	res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});
};

exports.new = function(req, res){
	var quiz = models.Quiz.build(
           {pregunta: "Pregunta", respuesta: "Respuesta", categorias: "Categorias"}
		);
	res.render('quizes/new', {quiz: quiz, errors: []});
};

exports.create = function(req, res){
	 var quiz = models.Quiz.build(req.body.quiz);
	 quiz.save({fields: ["pregunta", "respuesta", "categorias"]}).then(function(){
	 	res.redirect('/quizes');
	 })
	
};

exports.edit = function(req, res){
	var quiz = req.quiz;
	res.render('quizes/edit', {quiz: quiz, errors: []});
};

exports.update = function(req, res){
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.categorias = req.body.quiz.categorias;
	req.quiz.validate().then(function(err){
		if(err){
			res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
		}else{
			req.quiz.save({fields: ["pregunta", "respuesta", "categorias"]})
			.then(function(){res.redirect('/quizes');});
		}
	}).catch(function(error){next(error)});
};

exports.destroy = function(req, res){
	req.quiz.destroy().then(function(){
		res.redirect('/quizes');
	}).catch(function(error){next(error)});
};
exports.statistics = function(req, res, next){
	models.Quiz.count().then(function(numPreg){
	models.Comment.count().then(function(numComen){
      models.Comment.count({COUNT: {DISTINCT:"QuizId"}})
   // models.Sequelize.query('SELECT COUNT ( DISTINCT  "quizId" ) FROM "Comments"')
   //y mil cosas mas y no di con la tecla 
	.then(function(conComen){
		res.render('quizes/statistics.ejs', {
			numPreg: numPreg,
			numComen: numComen,
			comenxpreg: (numComen/numPreg).toFixed(2),
			sinComen: (numPreg - conComen),
			conComen: conComen,
			errors: []
		});
	}).catch(function(error){next(error);});	
	}).catch(function(error){next(error);});	
	}).catch(function(error){next(error);});
};