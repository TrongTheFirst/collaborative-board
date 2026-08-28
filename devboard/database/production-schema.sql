drop database if exists devboard;
create database devboard;
use devboard;

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

create table `role`(
	role_id int primary key auto_increment,
	name varchar(25) not null
);


create table board_members(
	id bigint primary key auto_increment,
	user_id bigint not null,
	board_id bigint not null,
	role_id int not null default 1,
	joined_at timestamp not null,
	
	constraint board_members_board
		foreign key(board_id)
		references board(board_id),
		
	constraint board_members_user
		foreign key(user_id)
		references `user` (user_id),
		
	constraint board_members_role
		foreign key(role_id)
		references `role` (role_id)
);
