package chartreview;

/**
 * Created by ryancornia on 10/2/14.
 */
public class ReportServiceTest {

    public void iaaTest() {

        // Removed from ReportService and put here in case this is desired for unit testing.

        // LARGE Wiki example; Case 1 - 14 raters, 10 items; 5 categories with wiki rater agreement, k = 0.21 (the wiki example exactly)
//        for(int i = 1; i <= 5; i++)
//        {
//            classificationList.add("class"+i);
//        }
//        for(int i = 1; i <= 10; i++)
//        {
//            patientIdList.add("patient"+i);
//        }
//
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 14);
//        patientIdToClassificationCountMapMap.put("patient1", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 2);
//        classificationCountMap.put("class3", 6);
//        classificationCountMap.put("class4", 4);
//        classificationCountMap.put("class5", 2);
//        patientIdToClassificationCountMapMap.put("patient2", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 3);
//        classificationCountMap.put("class4", 5);
//        classificationCountMap.put("class5", 6);
//        patientIdToClassificationCountMapMap.put("patient3", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 3);
//        classificationCountMap.put("class3", 9);
//        classificationCountMap.put("class4", 2);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient4", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 2);
//        classificationCountMap.put("class3", 8);
//        classificationCountMap.put("class4", 1);
//        classificationCountMap.put("class5", 1);
//        patientIdToClassificationCountMapMap.put("patient5", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 7);
//        classificationCountMap.put("class2", 7);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient6", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 3);
//        classificationCountMap.put("class2", 2);
//        classificationCountMap.put("class3", 6);
//        classificationCountMap.put("class4", 3);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient7", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 5);
//        classificationCountMap.put("class3", 3);
//        classificationCountMap.put("class4", 2);
//        classificationCountMap.put("class5", 2);
//        patientIdToClassificationCountMapMap.put("patient8", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 6);
//        classificationCountMap.put("class2", 5);
//        classificationCountMap.put("class3", 2);
//        classificationCountMap.put("class4", 1);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient9", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 2);
//        classificationCountMap.put("class3", 2);
//        classificationCountMap.put("class4", 3);
//        classificationCountMap.put("class5", 7);
//        patientIdToClassificationCountMapMap.put("patient10", classificationCountMap);

        // Scotts example case 2; Scott test case – kappa is wacky: Case 2 - 3 raters, 17 items; 4 categories with mostly rater agreement (except for on 2 items where one rater differed, k = -0.04
//        for(int i = 1; i <= 4; i++)
//        {
//            classificationList.add("class"+i);
//        }
//        for(int i = 1; i <= 17; i++)
//        {
//            patientIdList.add("patient"+i);
//        }
//
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 3);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        patientIdToClassificationCountMapMap.put("patient1", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 3);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        patientIdToClassificationCountMapMap.put("patient2", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient3", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient4", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient5", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient6", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient7", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient8", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient9", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient10", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient11", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient12", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient13", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient14", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient15", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 1);
//        classificationCountMap.put("class4", 2);
//        patientIdToClassificationCountMapMap.put("patient16", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 1);
//        classificationCountMap.put("class4", 2);
//        patientIdToClassificationCountMapMap.put("patient17", classificationCountMap);

//        // Scotts example case 2.b; Scott test case – kappa is wacky: Case 2b - 3 raters, 17 items; 4 categories with mostly rater agreement (except for on 2 items where one rater differed, k = -0.04) NO empty columns first two rows modified
//        for(int i = 1; i <= 4; i++)
//        {
//            classificationList.add("class"+i);
//        }
//        for(int i = 1; i <= 17; i++)
//        {
//            patientIdList.add("patient"+i);
//        }
//
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 3);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        patientIdToClassificationCountMapMap.put("patient1", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 3);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        patientIdToClassificationCountMapMap.put("patient2", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient3", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient4", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient5", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient6", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient7", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient8", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient9", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient10", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient11", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient12", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient13", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient14", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient15", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 1);
//        classificationCountMap.put("class4", 2);
//        patientIdToClassificationCountMapMap.put("patient16", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 1);
//        classificationCountMap.put("class4", 2);
//        patientIdToClassificationCountMapMap.put("patient17", classificationCountMap);

        // Scotts example case 2c; Scott test case – kappa is good: Case 2.c - 3 raters, 17 items; 2 categories with mostly rater agreement (except for on 2 items where one rater differed, k = -0.04) no empty columns
//        for(int i = 3; i <= 4; i++)
//        {
//            classificationList.add("class"+i);
//        }
//        for(int i = 1; i <= 17; i++)
//        {
//            patientIdList.add("patient"+i);
//        }
//
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        patientIdToClassificationCountMapMap.put("patient1", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        patientIdToClassificationCountMapMap.put("patient2", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient3", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient4", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient5", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient6", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient7", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient8", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient9", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient10", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient11", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient12", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient13", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient14", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient15", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class3", 1);
//        classificationCountMap.put("class4", 2);
//        patientIdToClassificationCountMapMap.put("patient16", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class3", 1);
//        classificationCountMap.put("class4", 2);
//        patientIdToClassificationCountMapMap.put("patient17", classificationCountMap);

        // Scotts example case 3; Case 3  - 3 raters, 17 items; 4 categories with perfect agreement all one category, k = NaN
//        for(int i = 1; i <= 4; i++)
//        {
//            classificationList.add("class"+i);
//        }
//        for(int i = 1; i <= 17; i++)
//        {
//            patientIdList.add("patient"+i);
//        }
//
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient1", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient2", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient3", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient4", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient5", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient6", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient7", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient8", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient9", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient10", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient11", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient12", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient13", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient14", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient15", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient16", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient17", classificationCountMap);

        // Scotts example case 4; Case 4  - 3 raters, 17 items; 4 categories with perfect agreement all but two are in same column, k = 1.0//        for(int i = 1; i <= 4; i++)
//        {
//            classificationList.add("class"+i);
//        }
//        for(int i = 1; i <= 17; i++)
//        {
//            patientIdList.add("patient"+i);
//        }
//
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient1", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient2", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient3", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient4", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient5", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient6", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient7", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient8", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient9", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient10", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient11", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient12", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient13", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient14", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        patientIdToClassificationCountMapMap.put("patient15", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 3);
//        classificationCountMap.put("class4", 0);
//        patientIdToClassificationCountMapMap.put("patient16", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 3);
//        classificationCountMap.put("class4", 0);
//        patientIdToClassificationCountMapMap.put("patient17", classificationCountMap);

        // SMALL perfect, increase all; Increasing raters, items, categories proportionally – kappa is good:  Case 5 - 2 raters; 2 items; 2 categories with perfect rater agreement, k= 1.0 (my original test case
//        for(int i = 1; i <= 2; i++)
//        {
//            classificationList.add("class"+i);
//        }
//        for(int i = 1; i <= 2; i++)
//        {
//            patientIdList.add("patient"+i);
//        }
//        patientIdToClassificationCountMapMap = new HashMap<String, List>();
//        def classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        patientIdToClassificationCountMapMap.put("patient1", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 2);
//        patientIdToClassificationCountMapMap.put("patient2", classificationCountMap);

        // MEDIUM perfect, increase all; Case 6 - 7 raters; 5 items; 4 categories with perfect rater agreement, k = 1.0
//        for(int i = 1; i <= 4; i++)
//        {
//            classificationList.add("class"+i);
//        }
//        for(int i = 1; i <= 5; i++)
//        {
//            patientIdList.add("patient"+i);
//        }
//
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 7);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        patientIdToClassificationCountMapMap.put("patient1", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 7);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        patientIdToClassificationCountMapMap.put("patient2", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 7);
//        classificationCountMap.put("class4", 0);
//        patientIdToClassificationCountMapMap.put("patient3", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 7);
//        patientIdToClassificationCountMapMap.put("patient4", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 7);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        patientIdToClassificationCountMapMap.put("patient5", classificationCountMap);

        // LARGE Perfect increase all; Case 7 - 14 raters, 10 items; 5 categories with perfect rater agreement, k = 1.0 (the wiki example size, but with perfect annotator agreement)
//        for(int i = 1; i <= 5; i++)
//        {
//            classificationList.add("class"+i);
//        }
//        for(int i = 1; i <= 10; i++)
//        {
//            patientIdList.add("patient"+i);
//        }
//
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 14);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient1", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 14);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient2", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 14);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient3", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 14);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient4", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 14);
//        patientIdToClassificationCountMapMap.put("patient5", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 14);
//        patientIdToClassificationCountMapMap.put("patient6", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 14);
//        patientIdToClassificationCountMapMap.put("patient7", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 14);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient8", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 14);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 0);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient9", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 14);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient10", classificationCountMap);

        // MEDIUM perfect, increase raters; Increasing raters only – kappa is good: Case 8 - 7 raters, 2 items; 2 categories with perfect rater agreement, k = 1.0 (the wiki example size, but with perfect annotator agreement)
//        for(int i = 1; i <= 2; i++)
//        {
//            classificationList.add("class"+i);
//        }
//        for(int i = 1; i <= 2; i++)
//        {
//            patientIdList.add("patient"+i);
//        }
//
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 7);
//        classificationCountMap.put("class2", 0);
//        patientIdToClassificationCountMapMap.put("patient1", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 7);
//        patientIdToClassificationCountMapMap.put("patient2", classificationCountMap);

        // LARGE perfect, increase raters; Case 9 - 14 raters, 2 items; 2 categories with perfect rater agreement, k = 1.0 (the wiki example size, but with perfect annotator agreement)
//        for(int i = 1; i <= 2; i++)
//        {
//            classificationList.add("class"+i);
//        }
//        for(int i = 1; i <= 2; i++)
//        {
//            patientIdList.add("patient"+i);
//        }
//
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 14);
//        classificationCountMap.put("class2", 0);
//        patientIdToClassificationCountMapMap.put("patient1", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 14);
//        patientIdToClassificationCountMapMap.put("patient2", classificationCountMap);

        // MEDIUM perfect, increase items; Increasing items only – kappa is good: Case 10 - 2 raters, 5 items; 2 categories with perfect rater agreement, k = 1.0
//        for(int i = 1; i <= 2; i++)
//        {
//            classificationList.add("class"+i);
//        }
//        for(int i = 1; i <= 5; i++)
//        {
//            patientIdList.add("patient"+i);
//        }
//
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        patientIdToClassificationCountMapMap.put("patient1", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 2);
//        patientIdToClassificationCountMapMap.put("patient2", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        patientIdToClassificationCountMapMap.put("patient3", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 2);
//        patientIdToClassificationCountMapMap.put("patient4", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        patientIdToClassificationCountMapMap.put("patient5", classificationCountMap);

        // LARGE increase items only; Case 11 - 2 raters, 10 items; 2 categories with perfect rater agreement, k = 1.0
//        for(int i = 1; i <= 2; i++)
//        {
//            classificationList.add("class"+i);
//        }
//        for(int i = 1; i <= 10; i++)
//        {
//            patientIdList.add("patient"+i);
//        }
//
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        patientIdToClassificationCountMapMap.put("patient1", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 2);
//        patientIdToClassificationCountMapMap.put("patient2", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        patientIdToClassificationCountMapMap.put("patient3", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 2);
//        patientIdToClassificationCountMapMap.put("patient4", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        patientIdToClassificationCountMapMap.put("patient5", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        patientIdToClassificationCountMapMap.put("patient6", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        patientIdToClassificationCountMapMap.put("patient7", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        patientIdToClassificationCountMapMap.put("patient8", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        patientIdToClassificationCountMapMap.put("patient9", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        patientIdToClassificationCountMapMap.put("patient10", classificationCountMap);

        // MEDIUM Increase classifications;Increasing categories only – kappa is good: Case 12 - 2 raters, 2 items; 4 categories with perfect rater agreement, k = 1.0
//        for(int i = 1; i <= 4; i++)
//        {
//            classificationList.add("class"+i);
//        }
//        for(int i = 1; i <= 2; i++)
//        {
//            patientIdList.add("patient"+i);
//        }
//
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        patientIdToClassificationCountMapMap.put("patient1", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 2);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        patientIdToClassificationCountMapMap.put("patient2", classificationCountMap);

        // LARGE increase classifications; Case 13 - 2 raters, 2 items; 5 categories with perfect rater agreement, k = 1.0
//        for(int i = 1; i <= 5; i++)
//        {
//            classificationList.add("class"+i);
//        }
//        for(int i = 1; i <= 2; i++)
//        {
//            patientIdList.add("patient"+i);
//        }
//
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient1", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 2);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient2", classificationCountMap);

        // Original Fleiss example
//        for(int i = 1; i <= 5; i++)
//        {
//            classificationList.add("class"+i);
//        }
//        for(int i = 1; i <= 30; i++)
//        {
//            patientIdList.add("patient"+i);
//        }
//
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 6);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient1", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 3);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 3);
//        patientIdToClassificationCountMapMap.put("patient2", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 1);
//        classificationCountMap.put("class3", 4);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 1);
//        patientIdToClassificationCountMapMap.put("patient3", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 6);
//        patientIdToClassificationCountMapMap.put("patient4", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 3);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient5", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 4);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient6", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 4);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 2);
//        patientIdToClassificationCountMapMap.put("patient7", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 3);
//        classificationCountMap.put("class4", 1);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient8", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 4);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient9", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 6);
//        patientIdToClassificationCountMapMap.put("patient10", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 1);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 5);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient11", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 1);
//        classificationCountMap.put("class2", 1);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 4);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient12", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 3);
//        classificationCountMap.put("class3", 3);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient13", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 1);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 5);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient14", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 2);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 3);
//        classificationCountMap.put("class5", 1);
//        patientIdToClassificationCountMapMap.put("patient15", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 5);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 1);
//        patientIdToClassificationCountMapMap.put("patient16", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 3);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 1);
//        classificationCountMap.put("class5", 2);
//        patientIdToClassificationCountMapMap.put("patient17", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 5);
//        classificationCountMap.put("class2", 1);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient18", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 2);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 4);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient19", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 1);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 2);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 3);
//        patientIdToClassificationCountMapMap.put("patient20", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 6);
//        patientIdToClassificationCountMapMap.put("patient21", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 1);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 5);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient22", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 2);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 1);
//        classificationCountMap.put("class5", 3);
//        patientIdToClassificationCountMapMap.put("patient23", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 2);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 4);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient24", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 1);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 4);
//        classificationCountMap.put("class5", 1);
//        patientIdToClassificationCountMapMap.put("patient25", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 5);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 1);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient26", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 4);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 2);
//        patientIdToClassificationCountMapMap.put("patient27", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 2);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 4);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient28", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 1);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 5);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 0);
//        patientIdToClassificationCountMapMap.put("patient29", classificationCountMap);
//        classificationCountMap = new HashMap<String, Integer>();
//        classificationCountMap.put("class1", 0);
//        classificationCountMap.put("class2", 0);
//        classificationCountMap.put("class3", 0);
//        classificationCountMap.put("class4", 0);
//        classificationCountMap.put("class5", 6);
//        patientIdToClassificationCountMapMap.put("patient30", classificationCountMap);


    }
}
