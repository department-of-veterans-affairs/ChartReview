DROP TABLE IF EXISTS `care_site`;
CREATE TABLE `care_site` 
    ( 
     `care_site_id` INTEGER  NOT NULL , 
     `location_id` INTEGER , 
     `organization_id` INTEGER , 
     `place_of_service_concept_id` INTEGER , 
     `care_site_source_value` VARCHAR (50) , 
     `place_of_service_source_value` VARCHAR (50) ,
  PRIMARY KEY (`care_site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS `cohort`;
CREATE TABLE `cohort` 
    ( 
     `cohort_id` INTEGER  NOT NULL , 
     `cohort_concept_id` INTEGER  NOT NULL , 
     `cohort_start_date` DATE  NOT NULL , 
     `cohort_end_date` DATE , 
     `subject_id` INTEGER  NOT NULL , 
     `stop_reason` VARCHAR (20) ,
  PRIMARY KEY (`cohort_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS `condition_era`;
CREATE TABLE `condition_era`
    ( 
     `condition_era_id` INTEGER  NOT NULL , 
     `person_id` INTEGER  NOT NULL , 
     `condition_concept_id` INTEGER  NOT NULL , 
     `condition_era_start_date` DATE  NOT NULL , 
     `condition_era_end_date` DATE  NOT NULL , 
     `condition_type_concept_id` INTEGER  NOT NULL , 
     `condition_occurrence_count` bigint ,
  PRIMARY KEY (`condition_era_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS `condition_occurrence`;
CREATE TABLE `condition_occurrence` 
    ( 
     `condition_occurrence_id` INTEGER  NOT NULL , 
     `person_id` INTEGER  NOT NULL , 
     `condition_concept_id` INTEGER  NOT NULL , 
     `condition_start_date` DATE  NOT NULL , 
     `condition_end_date` DATE , 
     `condition_type_concept_id` INTEGER  NOT NULL , 
     `stop_reason` VARCHAR (20) , 
     `associated_provider_id` INTEGER , 
     `visit_occurrence_id` INTEGER , 
     `condition_source_value` VARCHAR (50) ,
  PRIMARY KEY (`condition_occurrence_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS `death`;
CREATE TABLE `death` 
    ( 
     `person_id` INTEGER  NOT NULL , 
     `death_date` DATE  NOT NULL , 
     `death_type_concept_id` INTEGER  NOT NULL , 
     `cause_of_death_concept_id` INTEGER , 
     `cause_of_death_source_value` VARCHAR (50) ,
  PRIMARY KEY (`person_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS drug_cost;
CREATE TABLE drug_cost
    ( 
     drug_cost_id INTEGER  NOT NULL , 
     drug_exposure_id INTEGER  NOT NULL , 
     paid_copay decimal (8,2) , 
     paid_coinsurance decimal (8,2) , 
     paid_toward_deductible decimal (8,2) , 
     paid_by_payer decimal (8,2) , 
     paid_by_coordination_benefits decimal (8,2) , 
     total_out_of_pocket decimal (8,2) , 
     total_paid decimal (8,2) , 
     ingredient_cost decimal (8,2) , 
     dispensing_fee decimal (8,2) , 
     average_wholesale_price decimal (8,2) , 
     payer_plan_period_id INTEGER ,
  PRIMARY KEY (drug_cost_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS drug_era;
CREATE TABLE drug_era 
    ( 
     drug_era_id INTEGER  NOT NULL , 
     person_id INTEGER  NOT NULL , 
     drug_concept_id INTEGER  NOT NULL , 
     drug_era_start_date DATE  NOT NULL , 
     drug_era_end_date DATE  NOT NULL , 
     drug_type_concept_id INTEGER  NOT NULL , 
     drug_exposure_count INTEGER (4) ,
  PRIMARY KEY (drug_era_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS drug_exposure;
CREATE TABLE drug_exposure 
    ( 
     drug_exposure_id INTEGER  NOT NULL , 
     person_id INTEGER  NOT NULL , 
     drug_concept_id INTEGER  NOT NULL , 
     drug_exposure_start_date DATE  NOT NULL , 
     drug_exposure_end_date DATE , 
     drug_type_concept_id INTEGER  NOT NULL , 
     stop_reason VARCHAR (20) , 
     refills INTEGER (3) , 
     quantity INTEGER (4) , 
     days_supply INTEGER (4) , 
     sig VARCHAR (500) , 
     prescribing_provider_id INTEGER , 
     visit_occurrence_id INTEGER , 
     relevant_condition_concept_id INTEGER , 
     drug_source_value VARCHAR (50) ,
  PRIMARY KEY (drug_exposure_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS location;
CREATE TABLE location 
    ( 
     location_id INTEGER  NOT NULL , 
     address_1 VARCHAR (50) , 
     address_2 VARCHAR (50) , 
     city VARCHAR (50) , 
     state CHAR (2) , 
     zip VARCHAR (9) , 
     county VARCHAR (20) , 
     location_source_value VARCHAR (50) ,
  PRIMARY KEY (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS observation;
CREATE TABLE observation 
    ( 
     observation_id INTEGER  NOT NULL , 
     person_id INTEGER  NOT NULL , 
     observation_concept_id INTEGER  NOT NULL , 
     observation_date DATE  NOT NULL , 
     observation_time DATE , 
     value_as_number decimal (14,3) , 
     value_as_string VARCHAR (60) , 
     value_as_concept_id INTEGER , 
     unit_concept_id INTEGER , 
     range_low decimal (14,3) , 
     range_high decimal (14,3) , 
     observation_type_concept_id INTEGER  NOT NULL , 
     associated_provider_id INTEGER  NOT NULL , 
     visit_occurrence_id INTEGER , 
     relevant_condition_concept_id INTEGER , 
     observation_source_value VARCHAR (50) , 
     units_source_value VARCHAR (50) ,
  PRIMARY KEY (observation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE INDEX observation_person_idx ON observation 
    ( 
     person_id ASC , 
     observation_concept_id ASC 
    ) ;

DROP TABLE IF EXISTS observation_period;
CREATE TABLE observation_period 
    ( 
     observation_period_id INTEGER  NOT NULL , 
     person_id INTEGER  NOT NULL , 
     observation_period_start_date DATE  NOT NULL , 
     observation_period_end_date DATE  NOT NULL ,
  PRIMARY KEY (observation_period_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE UNIQUE INDEX observation_period_person ON observation_period 
    ( 
     person_id ASC , 
     observation_period_start_date ASC 
    ) 
;

DROP TABLE IF EXISTS organization;
CREATE TABLE organization 
    ( 
     organization_id INTEGER  NOT NULL , 
     place_of_service_concept_id INTEGER , 
     location_id INTEGER , 
     organization_source_value VARCHAR (50) , 
     place_of_service_source_value VARCHAR (50) ,
  PRIMARY KEY (organization_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE INDEX organization_oraganization_pos ON organization 
    ( 
     organization_source_value ASC , 
     place_of_service_source_value ASC 
    ) 
;

DROP TABLE IF EXISTS payer_plan_period;
CREATE TABLE payer_plan_period 
    ( 
     payer_plan_period_id INTEGER  NOT NULL , 
     person_id INTEGER  NOT NULL , 
     payer_plan_period_start_date DATE  NOT NULL , 
     payer_plan_period_end_date DATE  NOT NULL , 
     payer_source_value VARCHAR (50) , 
     plan_source_value VARCHAR (50) , 
     family_source_value VARCHAR (50) ,
  PRIMARY KEY (payer_plan_period_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS person;
CREATE TABLE person 
    ( 
     person_id INTEGER  NOT NULL , 
     gender_concept_id INTEGER  NOT NULL , 
     year_of_birth INTEGER (4)  NOT NULL , 
     month_of_birth INTEGER (2) , 
     day_of_birth INTEGER (2) , 
     race_concept_id INTEGER , 
     ethnicity_concept_id INTEGER , 
     location_id INTEGER , 
     provider_id INTEGER , 
     care_site_id INTEGER , 
     person_source_value VARCHAR (50) , 
     gender_source_value VARCHAR (50) , 
     race_source_value VARCHAR (50) , 
     ethnicity_source_value VARCHAR (50) ,
  PRIMARY KEY (person_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS procedure_cost;
CREATE TABLE procedure_cost 
    ( 
     procedure_cost_id INTEGER  NOT NULL , 
     procedure_occurrence_id INTEGER  NOT NULL , 
     paid_copay decimal (8,2) , 
     paid_coinsurance decimal (8,2) , 
     paid_toward_deductible decimal (8,2) , 
     paid_by_payer decimal (8,2) , 
     paid_by_coordination_benefits decimal (8,2) , 
     total_out_of_pocket decimal (8,2) , 
     total_paid decimal (8,2) , 
     disease_class_concept_id INTEGER , 
     revenue_code_concept_id INTEGER , 
     payer_plan_period_id INTEGER , 
     disease_class_source_value VARCHAR (50) , 
     revenue_code_source_value VARCHAR (50) ,
  PRIMARY KEY (procedure_cost_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS procedure_occurrence;
CREATE TABLE procedure_occurrence 
    ( 
     procedure_occurrence_id INTEGER  NOT NULL , 
     person_id INTEGER  NOT NULL , 
     procedure_concept_id INTEGER  NOT NULL , 
     procedure_date DATE  NOT NULL , 
     procedure_type_concept_id INTEGER  NOT NULL , 
     associated_provider_id INTEGER , 
     visit_occurrence_id INTEGER , 
     relevant_condition_concept_id INTEGER , 
     procedure_source_value VARCHAR (50) ,
  PRIMARY KEY (procedure_occurrence_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS provider;
CREATE TABLE provider 
    ( 
     provider_id INTEGER  NOT NULL , 
     NPI VARCHAR (20) , 
     DEA VARCHAR (20) , 
     specialty_concept_id INTEGER , 
     care_site_id INTEGER , 
     provider_source_value VARCHAR (50)  NOT NULL , 
     specialty_source_value VARCHAR (50) ,
  PRIMARY KEY (provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS visit_occurrence;
CREATE TABLE visit_occurrence 
    ( 
     visit_occurrence_id INTEGER  NOT NULL , 
     person_id INTEGER  NOT NULL , 
     visit_start_date DATE  NOT NULL , 
     visit_end_date DATE  NOT NULL , 
     place_of_service_concept_id INTEGER  NOT NULL , 
     care_site_id INTEGER , 
     place_of_service_source_value VARCHAR (50) ,
  PRIMARY KEY (visit_occurrence_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE INDEX visit_occurrence_peson_date ON visit_occurrence 
    ( 
     person_id ASC , 
     visit_start_date ASC 
    ) 
;

ALTER TABLE care_site 
    ADD CONSTRAINT care_site_location_FK FOREIGN KEY 
    ( 
     location_id
    ) 
    REFERENCES location 
    ( 
     location_id
    ) 
;

ALTER TABLE care_site 
    ADD CONSTRAINT care_site_organization_FK FOREIGN KEY 
    ( 
     organization_id
    ) 
    REFERENCES organization 
    ( 
     organization_id
    ) 
;


ALTER TABLE condition_era 
    ADD CONSTRAINT condition_era_PERSON_FK FOREIGN KEY 
    ( 
     person_id
    ) 
    REFERENCES person 
    ( 
     person_id
    ) 
;


ALTER TABLE condition_occurrence 
    ADD CONSTRAINT condition_occurrence_PERSON_FK FOREIGN KEY 
    ( 
     person_id
    ) 
    REFERENCES person 
    ( 
     person_id
    ) 
;


ALTER TABLE condition_occurrence 
    ADD CONSTRAINT condition_provider_FK FOREIGN KEY 
    ( 
     associated_provider_id
    ) 
    REFERENCES provider 
    ( 
     provider_id
    ) 
;


ALTER TABLE condition_occurrence 
    ADD CONSTRAINT condition_visit_FK FOREIGN KEY 
    ( 
     visit_occurrence_id
    ) 
    REFERENCES visit_occurrence 
    ( 
     visit_occurrence_id
    ) 
;


ALTER TABLE death 
    ADD CONSTRAINT death_PERSON_FK FOREIGN KEY 
    ( 
     person_id
    ) 
    REFERENCES person 
    ( 
     person_id
    ) 
;


ALTER TABLE drug_cost 
    ADD CONSTRAINT drug_cost_drug_exposure_FK FOREIGN KEY 
    ( 
     drug_exposure_id
    ) 
    REFERENCES drug_exposure 
    ( 
     drug_exposure_id
    ) 
;


ALTER TABLE drug_cost 
    ADD CONSTRAINT drug_cost_payer_plan_period_FK FOREIGN KEY 
    ( 
     payer_plan_period_id
    ) 
    REFERENCES payer_plan_period 
    ( 
     payer_plan_period_id
    ) 
;


ALTER TABLE drug_era 
    ADD CONSTRAINT drug_era_PERSON_FK FOREIGN KEY 
    ( 
     person_id
    ) 
    REFERENCES person 
    ( 
     person_id
    ) 
;


ALTER TABLE drug_exposure 
    ADD CONSTRAINT drug_exposure_PERSON_FK FOREIGN KEY 
    ( 
     person_id
    ) 
    REFERENCES person 
    ( 
     person_id
    ) 
;


ALTER TABLE drug_exposure 
    ADD CONSTRAINT drug_exposure_provider_FK FOREIGN KEY 
    ( 
     prescribing_provider_id
    ) 
    REFERENCES provider 
    ( 
     provider_id
    ) 
;


ALTER TABLE drug_exposure 
    ADD CONSTRAINT drug_visit_FK FOREIGN KEY 
    ( 
     visit_occurrence_id
    ) 
    REFERENCES visit_occurrence 
    ( 
     visit_occurrence_id
    ) 
;


ALTER TABLE observation 
    ADD CONSTRAINT observation_PERSON_FK FOREIGN KEY 
    ( 
     person_id
    ) 
    REFERENCES person 
    ( 
     person_id
    ) 
;


ALTER TABLE observation_period 
    ADD CONSTRAINT observation_period_PERSON_FK FOREIGN KEY 
    ( 
     person_id
    ) 
    REFERENCES person 
    ( 
     person_id
    ) 
;


ALTER TABLE observation 
    ADD CONSTRAINT observation_provider_FK FOREIGN KEY 
    ( 
     associated_provider_id
    ) 
    REFERENCES provider 
    ( 
     provider_id
    ) 
;


ALTER TABLE observation 
    ADD CONSTRAINT observation_visit_FK FOREIGN KEY 
    ( 
     visit_occurrence_id
    ) 
    REFERENCES visit_occurrence 
    ( 
     visit_occurrence_id
    ) 
;


ALTER TABLE organization 
    ADD CONSTRAINT organization_location_FK FOREIGN KEY 
    ( 
     location_id
    ) 
    REFERENCES location 
    ( 
     location_id
    ) 
;


ALTER TABLE payer_plan_period 
    ADD CONSTRAINT payer_plan_period_PERSON_FK FOREIGN KEY 
    ( 
     person_id
    ) 
    REFERENCES person 
    ( 
     person_id
    ) 
;


ALTER TABLE person 
    ADD CONSTRAINT person_care_site_FK FOREIGN KEY 
    ( 
     care_site_id
    ) 
    REFERENCES care_site 
    ( 
     care_site_id
    ) 
;


ALTER TABLE person 
    ADD CONSTRAINT person_location_FK FOREIGN KEY 
    ( 
     location_id
    ) 
    REFERENCES location 
    ( 
     location_id
    ) 
;


ALTER TABLE person 
    ADD CONSTRAINT person_provider_FK FOREIGN KEY 
    ( 
     provider_id
    ) 
    REFERENCES provider 
    ( 
     provider_id
    ) 
;


ALTER TABLE procedure_cost 
    ADD CONSTRAINT procedure_cost_payer_plan_FK FOREIGN KEY 
    ( 
     payer_plan_period_id
    ) 
    REFERENCES payer_plan_period 
    ( 
     payer_plan_period_id
    ) 
;


ALTER TABLE procedure_cost 
    ADD CONSTRAINT procedure_cost_procedure_FK FOREIGN KEY 
    ( 
     procedure_occurrence_id
    ) 
    REFERENCES procedure_occurrence 
    ( 
     procedure_occurrence_id
    ) 
;


ALTER TABLE procedure_occurrence 
    ADD CONSTRAINT procedure_occurrence_PERSON_FK FOREIGN KEY 
    ( 
     person_id
    ) 
    REFERENCES person 
    ( 
     person_id
    ) 
;


ALTER TABLE procedure_occurrence 
    ADD CONSTRAINT procedure_provider_FK FOREIGN KEY 
    ( 
     associated_provider_id
    ) 
    REFERENCES provider 
    ( 
     provider_id
    ) 
;


ALTER TABLE procedure_occurrence 
    ADD CONSTRAINT procedure_visit_FK FOREIGN KEY 
    ( 
     visit_occurrence_id
    ) 
    REFERENCES visit_occurrence 
    ( 
     visit_occurrence_id
    ) 
;


ALTER TABLE provider 
    ADD CONSTRAINT provider_care_site_FK FOREIGN KEY 
    ( 
     care_site_id
    ) 
    REFERENCES care_site 
    ( 
     care_site_id
    ) 
;


ALTER TABLE visit_occurrence 
    ADD CONSTRAINT visit_occurrence_PERSON_FK FOREIGN KEY 
    ( 
     person_id
    ) 
    REFERENCES person 
    ( 
     person_id
    ) 
;

