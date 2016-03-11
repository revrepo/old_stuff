console.log("Seeding Users....");
var users = [{
    firstname: 'rev',
    lastname: 'software',
    username: "revsoftware",
    email: "dev@revsw.com",
    password: "25d55ad283aa400af464c76d713c07ad",
    role: "revadmin",
    status : true
  },
  {
	  firstname: 'rev1',
	  lastname: 'software1',
	  username: "revsoftware1",
	  email: "dev1@revsw.com",
	  password: "25d55ad283aa400af464c76d713c07ad",
	  role: "revadmin",
	  status : true
  },
  {
	  firstname: 'rev2',
	  lastname: 'software2',
	  username: "revsoftware2",
	  email: "dev2@revsw.com",
	  password: "25d55ad283aa400af464c76d713c07ad",
	  role: "revadmin",
	  status : true
  },
  {
	  firstname: 'rev3',
	  lastname: 'software3',
	  username: "revsoftware3",
	  email: "dev3@revsw.com",
	  password: "25d55ad283aa400af464c76d713c07ad",
	  role: "revadmin",
	  status : true
  }
];

users.forEach(function(obj, err){
  User.create(obj, function(err, user){
	  if(err){
		  console.log("err---->>>>",err);
	  }else{
		  console.log("user---->>>>",user);
	  }
  });
});