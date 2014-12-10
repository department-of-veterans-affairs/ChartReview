SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

--
-- Table structure for table `annotation_schema`
--

DROP TABLE IF EXISTS `annotation_schema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `annotation_schema` (
  `id` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attribute_def`
--

DROP TABLE IF EXISTS `attribute_def`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attribute_def` (
  `id` varchar(255) NOT NULL,
  `color` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `numeric_high` double DEFAULT NULL,
  `numeric_low` double DEFAULT NULL,
  `min_date` datetime DEFAULT NULL,
  `max_date` datetime DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  `annotation_schema` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKA9A5AFE29BCC2C61` (`annotation_schema`),
  CONSTRAINT `FKA9A5AFE29BCC2C61` FOREIGN KEY (`annotation_schema`) REFERENCES `annotation_schema` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attribute_def_option_def`
--

DROP TABLE IF EXISTS `attribute_def_option_def`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attribute_def_option_def` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `attribute_def` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1ADD3DB8AEEE15AB` (`attribute_def`),
  CONSTRAINT `FK1ADD3DB8AEEE15AB` FOREIGN KEY (`attribute_def`) REFERENCES `attribute_def` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `class_def`
--

DROP TABLE IF EXISTS `class_def`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_def` (
  `id` varchar(255) NOT NULL,
  `color` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `annotation_schema` varchar(255) DEFAULT NULL,
  `parent` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKFF70E0BE9BCC2C61` (`annotation_schema`),
  KEY `FKFF70E0BE920DB217` (`parent`),
  CONSTRAINT `FKFF70E0BE920DB217` FOREIGN KEY (`parent`) REFERENCES `class_def` (`id`),
  CONSTRAINT `FKFF70E0BE9BCC2C61` FOREIGN KEY (`annotation_schema`) REFERENCES `annotation_schema` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `class_def_attribute_defs`
--

DROP TABLE IF EXISTS `class_def_attribute_defs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_def_attribute_defs` (
  `class_def` varchar(255) NOT NULL,
  `attribute_defs` varchar(255) NOT NULL,
  PRIMARY KEY (`class_def`,`attribute_defs`),
  KEY `FK22728672CCD38A2B` (`class_def`),
  KEY `FK227286729058B29A` (`attribute_defs`),
  CONSTRAINT `FK227286729058B29A` FOREIGN KEY (`attribute_defs`) REFERENCES `attribute_def` (`id`),
  CONSTRAINT `FK22728672CCD38A2B` FOREIGN KEY (`class_def`) REFERENCES `class_def` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `class_rel_def`
--

DROP TABLE IF EXISTS `class_rel_def`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_rel_def` (
  `id` varchar(255) NOT NULL,
  `color` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `type` int(11) NOT NULL,
  `annotation_schema` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKB8ECF989BCC2C61` (`annotation_schema`),
  CONSTRAINT `FKB8ECF989BCC2C61` FOREIGN KEY (`annotation_schema`) REFERENCES `annotation_schema` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `class_rel_def_attribute_defs`
--

DROP TABLE IF EXISTS `class_rel_def_attribute_defs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_rel_def_attribute_defs` (
  `class_rel_def` varchar(255) NOT NULL,
  `attribute_defs` varchar(255) NOT NULL,
  PRIMARY KEY (`class_rel_def`,`attribute_defs`),
  UNIQUE KEY `attribute_defs` (`attribute_defs`),
  KEY `FK6B31C8589058B29A` (`attribute_defs`),
  KEY `FK6B31C858FD8B1DC` (`class_rel_def`),
  CONSTRAINT `FK6B31C858FD8B1DC` FOREIGN KEY (`class_rel_def`) REFERENCES `class_rel_def` (`id`),
  CONSTRAINT `FK6B31C8589058B29A` FOREIGN KEY (`attribute_defs`) REFERENCES `attribute_def` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `class_rel_def_left_class_defs`
--

DROP TABLE IF EXISTS `class_rel_def_left_class_defs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_rel_def_left_class_defs` (
  `class_rel_def` varchar(255) NOT NULL,
  `left_class_defs` varchar(255) NOT NULL,
  PRIMARY KEY (`class_rel_def`,`left_class_defs`),
  UNIQUE KEY `left_class_defs` (`left_class_defs`),
  KEY `FKDD5C6806FD8B1DC` (`class_rel_def`),
  KEY `FKDD5C680686B11C1A` (`left_class_defs`),
  CONSTRAINT `FKDD5C680686B11C1A` FOREIGN KEY (`left_class_defs`) REFERENCES `class_def` (`id`),
  CONSTRAINT `FKDD5C6806FD8B1DC` FOREIGN KEY (`class_rel_def`) REFERENCES `class_rel_def` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `class_rel_def_right_class_defs`
--

DROP TABLE IF EXISTS `class_rel_def_right_class_defs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_rel_def_right_class_defs` (
  `class_rel_def` varchar(255) NOT NULL,
  `right_class_defs` varchar(255) NOT NULL,
  PRIMARY KEY (`class_rel_def`,`right_class_defs`),
  UNIQUE KEY `right_class_defs` (`right_class_defs`),
  KEY `FK1D23573F8CD54AE5` (`right_class_defs`),
  KEY `FK1D23573FFD8B1DC` (`class_rel_def`),
  CONSTRAINT `FK1D23573FFD8B1DC` FOREIGN KEY (`class_rel_def`) REFERENCES `class_rel_def` (`id`),
  CONSTRAINT `FK1D23573F8CD54AE5` FOREIGN KEY (`right_class_defs`) REFERENCES `class_def` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;



SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
