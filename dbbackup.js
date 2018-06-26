
      /*
	queries = [
	  "CREATE TABLE Users(userid int not null primary key auto_increment, email varchar(100) not null, firstname varchar(100) not null, address varchar(255), password varchar(255) not null)",
	  "CREATE TABLE Clients(clientid int not null primary key auto_increment, name varchar(100) not null, firstname varchar(100) not null, lastname varchar(100) not null, position varchar(255) not null)",
	  "CREATE TABLE Periods(userid int not null, foreign key (userid) references Users(userid), clientid int not null, foreign key (clientid) references Clients(clientid), periodid int not null primary key auto_increment, title varchar(255) not null, start datetime not null, end datetime not null)",
	  "create table Comments( periodid int not null, foreign key (periodid) references Periods(periodid), userid int not null, foreign key(userid) references Users(userid), comment varchar(255) not null, commentid int not null primary key auto_increment)",
	];

	async.each(queries, async function(q, cb){
	  await pool.query(q, async function(err,rows,fields){
	    await rows;
	    if (err){
	      console.log(err);
	    }
	  });
	}, cb(pool));

*/

