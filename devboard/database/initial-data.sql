use devboard; 

INSERT INTO role(name) values 
("Member"),
("Owner"),
("Viewer");

delete from room;

delete from board_element;
alter table board_element auto_increment = 1;

delete from board;
alter table board auto_increment = 1;
