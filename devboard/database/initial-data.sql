use devboard; 

INSERT INTO role(name) values 
("Member"),
("Owner"),
("Viewer");

delete from board;
alter table board auto_increment = 1;
