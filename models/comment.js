module.exports = function(sequelize, DataTypes){
	return sequelize.define('Coment',
		                     {texto: { type: DataTypes.STRING,
		                                validate: { notEmpty:
		                                	{msg: "-> Falta Comentario"}}
		                                }
		                            }
		                            );
}