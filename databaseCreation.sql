create table Accounts (email varchar(50) primary key, name varchar(50), password varchar(50), phonenumber varchar(15), image longblob, user_interests varchar(5000));
create table ResearchIdea (dateOfCreation datetime, advisor_email varchar(50), foreign key (advisor_email) references Accounts(email), research_name varchar(750) primary key, description text, interests text);
