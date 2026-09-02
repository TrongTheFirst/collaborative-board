drop database if exists devboard_test;
create database devboard_test;
use devboard_test;

create table `user` (
    user_id bigint primary key auto_increment,
    email text not null,
    display_name varchar(50) not null,
    password text not null,
    created_at timestamp not null
);

create table board(
	board_id bigint primary key auto_increment,
	owner_id bigint null,
	name varchar(50) not null,
	created_at timestamp not null,
	updated_at timestamp not null,
	
	constraint fk_board_user
		foreign key(owner_id)
		references `user`(user_id)
);

create table board_element(
	element_id bigint primary key auto_increment,
	board_id bigint not null,
	`type` varchar(50) not null,
	element_data JSON not null,
	
	constraint board_element_board
		foreign key(board_id)
		references board(board_id)
);

create table room(
	room_code varchar(50) not null primary key,
	board_id bigint not null,
	host_client_id varchar(50) not null,
	created_at timestamp not null,
	
	constraint room_board
		foreign key(board_id)
		references board(board_id)
);


create table `role`(
	role_id int primary key auto_increment,
	name varchar(25) not null
);


create table board_member(
	id bigint primary key auto_increment,
	display_name varchar(50),
	room_code varchar(50) not null,
	client_id varchar(50) not null,
	role_id int not null default 1,
	joined_at timestamp not null,

	constraint board_members_room
		foreign key(room_code)
		references room(room_code)
		on delete cascade,

	constraint board_members_role
		foreign key(role_id)
		references `role` (role_id),

	constraint board_member_room_client_unique
		unique (room_code, client_id)
);
delimiter //
create procedure set_known_good_state()
begin
	delete from board_member;
	alter table board_member auto_increment = 1;
	delete from role;
	alter table role auto_increment = 1;
	delete from room;
	delete from board_element;
	alter table board_element auto_increment = 1;
	delete from board;
	alter table board auto_increment = 1;
	delete from `user`;
    alter table `user` auto_increment = 1;
	

    insert into `user` (email, display_name, password, created_at) values
        ("a@email.com", "a","encoded-password",'2020-01-01 01:01:00'),
        ("b@email.com", "b","encoded-password",'2020-01-01 01:01:00');
    
    insert into board(owner_id, name, created_at, updated_at) values
    	(1, "B1",'2020-01-01 01:01:00','2020-01-01 01:01:00'),
    	(1, "B2",'2020-01-01 01:01:00','2020-01-01 01:01:00');
    
    insert into board_element(board_id, `type`, element_data) values
    	(1, "freedraw", '{"x":1,"y":1}');
    
    insert into `role` (name) values
    ("Member"), ("Owner"), ("Viewer");
    
    insert into room(room_code, board_id, host_client_id, created_at) values
    ("ABC123",1,"test-host-client-id",'2020-01-01 01:01:00');
    
    insert into board_member(id, user_id, display_name, room_code, role_id, joined_at) values
	(1, 1, "a", "ABC123", 1, '2020-01-01 01:01:00');
end //
delimiter ;