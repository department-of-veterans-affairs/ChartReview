IF OBJECT_ID('annotation_schema', 'U') IS NOT NULL DROP TABLE annotation_schema;
IF OBJECT_ID('attribute_def', 'U') IS NOT NULL DROP TABLE attribute_def;
IF OBJECT_ID('attribute_def_option_def', 'U') IS NOT NULL DROP TABLE attribute_def_option_def;
IF OBJECT_ID('class_def', 'U') IS NOT NULL DROP TABLE class_def;
IF OBJECT_ID('class_def_attribute_defs', 'U') IS NOT NULL DROP TABLE class_def_attribute_defs;
IF OBJECT_ID('class_rel_def', 'U') IS NOT NULL DROP TABLE class_rel_def;
IF OBJECT_ID('class_rel_def_attribute_defs', 'U') IS NOT NULL DROP TABLE class_rel_def_attribute_defs;
IF OBJECT_ID('class_rel_def_left_class_defs', 'U') IS NOT NULL DROP TABLE class_rel_def_left_class_defs;
IF OBJECT_ID('class_rel_def_right_class_defs', 'U') IS NOT NULL DROP TABLE class_rel_def_right_class_defs;


--
-- Table structure for table annotation_schema
--

CREATE TABLE annotation_schema (
  id varchar(255) NOT NULL,
  description varchar(255) DEFAULT NULL,
  name varchar(255) DEFAULT NULL,
  type int(11) DEFAULT NULL,
  PRIMARY KEY (id)
);

--
-- Table structure for table attribute_def
--

CREATE TABLE attribute_def (
  id varchar(255) NOT NULL,
  color varchar(255) DEFAULT NULL,
  name varchar(255) DEFAULT NULL,
  numeric_high double DEFAULT NULL,
  numeric_low double DEFAULT NULL,
  min_date datetime DEFAULT NULL,
  max_date datetime DEFAULT NULL,
  type int(11) DEFAULT NULL,
  annotation_schema varchar(255) DEFAULT NULL,
  PRIMARY KEY (id));

--
-- Table structure for table attribute_def_option_def
--

CREATE TABLE attribute_def_option_def (
  id varchar(255) NOT NULL,
  name varchar(255) DEFAULT NULL,
  attribute_def varchar(255) DEFAULT NULL,
  PRIMARY KEY (id));

--
-- Table structure for table class_def
--

CREATE TABLE class_def (
  id varchar(255) NOT NULL,
  color varchar(255) DEFAULT NULL,
  name varchar(255) DEFAULT NULL,
  annotation_schema varchar(255) DEFAULT NULL,
  parent varchar(255) DEFAULT NULL,
  PRIMARY KEY (id));

--
-- Table structure for table class_def_attribute_defs
--

CREATE TABLE class_def_attribute_defs (
  class_def varchar(255) NOT NULL,
  attribute_defs varchar(255) NOT NULL,
  PRIMARY KEY (class_def,attribute_defs));

--
-- Table structure for table class_rel_def
--

CREATE TABLE class_rel_def (
  id varchar(255) NOT NULL,
  color varchar(255) DEFAULT NULL,
  name varchar(255) DEFAULT NULL,
  type int(11) NOT NULL,
  annotation_schema varchar(255) DEFAULT NULL,
  PRIMARY KEY (id));

--
-- Table structure for table class_rel_def_attribute_defs
--

CREATE TABLE class_rel_def_attribute_defs (
  class_rel_def varchar(255) NOT NULL,
  attribute_defs varchar(255) NOT NULL,
  PRIMARY KEY (class_rel_def,attribute_defs));

--
-- Table structure for table class_rel_def_left_class_defs
--

CREATE TABLE class_rel_def_left_class_defs (
  class_rel_def varchar(255) NOT NULL,
  left_class_defs varchar(255) NOT NULL,
  PRIMARY KEY (class_rel_def,left_class_defs));

--
-- Table structure for table class_rel_def_right_class_defs
--

CREATE TABLE class_rel_def_right_class_defs (
  class_rel_def varchar(255) NOT NULL,
  right_class_defs varchar(255) NOT NULL,
  PRIMARY KEY (class_rel_def,right_class_defs));
