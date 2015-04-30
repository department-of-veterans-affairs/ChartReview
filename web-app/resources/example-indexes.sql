/**
 * Example additional index creation statements that can improve performance 
 * on mysql servers.
 */

ALTER TABLE `act_hi_taskinst` ADD INDEX `act_hi_taskinst_execution_id_INDX` (`EXECUTION_ID_`);
ALTER TABLE `act_hi_taskinst` ADD INDEX `act_hi_taskinst_end_time_INDX` (`END_TIME_`);
		
ALTER TABLE `act_hi_varinst` ADD INDEX `EXECUTION_ID_` (`EXECUTION_ID_`);
ALTER TABLE `act_hi_varinst` ADD INDEX `TASK_ID_` (`TASK_ID_`);
	
ALTER TABLE `act_ru_execution` ADD INDEX `idx_act_ru_execution_PROC_DEF_ID_` (`PROC_DEF_ID_`);
