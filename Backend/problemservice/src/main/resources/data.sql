SET FOREIGN_KEY_CHECKS=0;
DELETE FROM test_cases;
DELETE FROM problems;
DELETE FROM problem_subcategories;
DELETE FROM problem_categories;
INSERT INTO problem_categories(category_key,name,active) VALUES ('DSA','Data Structures & Algorithms',1);
INSERT INTO problem_subcategories(category_id,subcategory_key,name,active) VALUES
(1,'ARRAY','Arrays',1),(1,'STRING','Strings',1),(1,'LINKED_LIST','Linked List',1),
(1,'STACK','Stack',1),(1,'TREE','Trees',1),(1,'GRAPH','Graphs',1),
(1,'DP','Dynamic Programming',1),(1,'GREEDY','Greedy',1);
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Pair Sum Finder','Find two indices whose values sum to target.','EASY','Array,HashMap','1 <= n <= 100000','Use a hash map of seen values.',1,1,1000,256,1,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (1,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (1,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (1,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (1,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (1,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Array Rotation','Rotate array right by k positions.','EASY','Array','1 <= n <= 100000','Use reversal technique.',1,1,1000,256,1,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (2,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (2,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (2,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (2,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (2,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Maximum Consecutive Increase','Longest strictly increasing contiguous segment.','EASY','Array','1 <= n <= 100000','Track current streak.',1,1,1000,256,1,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (3,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (3,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (3,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (3,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (3,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Product Except Position','Return product except self.','MEDIUM','Array,Prefix','1 <= n <= 100000','Use prefix and suffix products.',1,1,1000,256,1,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (4,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (4,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (4,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (4,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (4,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Missing Positive Number','Smallest missing positive integer.','HARD','Array','1 <= n <= 100000','Place numbers at correct indices.',1,1,1000,256,1,2,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (5,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (5,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (5,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (5,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (5,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Balanced Brackets','Validate bracket sequence.','EASY','Stack','1 <= n <= 100000','Push opening brackets.',1,1,1000,256,1,2,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (6,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (6,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (6,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (6,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (6,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Palindrome Cleanup','Minimum removals to form palindrome.','MEDIUM','String,DP','1 <= n <= 100000','Use interval DP.',1,1,1000,256,1,2,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (7,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (7,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (7,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (7,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (7,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Character Frequency Sort','Sort by descending frequency.','MEDIUM','String,HashMap','1 <= n <= 100000','Count then sort.',1,1,1000,256,1,2,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (8,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (8,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (8,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (8,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (8,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Longest Unique Segment','Longest substring without repeats.','MEDIUM','String,SlidingWindow','1 <= n <= 100000','Maintain window.',1,1,1000,256,1,3,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (9,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (9,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (9,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (9,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (9,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Reverse Linked List','Reverse singly linked list.','EASY','LinkedList','1 <= n <= 100000','Iterative pointers.',1,1,1000,256,1,3,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (10,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (10,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (10,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (10,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (10,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Find Middle Node','Return middle node.','EASY','LinkedList','1 <= n <= 100000','Slow and fast pointers.',1,1,1000,256,1,3,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (11,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (11,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (11,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (11,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (11,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Detect Cycle','Check if linked list has cycle.','MEDIUM','LinkedList','1 <= n <= 100000','Floyd cycle detection.',1,1,1000,256,1,3,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (12,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (12,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (12,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (12,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (12,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Min Stack','Stack with O(1) min.','MEDIUM','Stack','1 <= n <= 100000','Maintain auxiliary min stack.',1,1,1000,256,1,4,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (13,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (13,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (13,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (13,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (13,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Queue Using Stacks','Implement queue using stacks.','MEDIUM','Stack,Queue','1 <= n <= 100000','Two-stack approach.',1,1,1000,256,1,4,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (14,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (14,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (14,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (14,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (14,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Next Greater Element','Next greater value to right.','MEDIUM','Stack','1 <= n <= 100000','Monotonic stack.',1,1,1000,256,1,4,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (15,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (15,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (15,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (15,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (15,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Tree Height','Compute binary tree height.','EASY','Tree','1 <= n <= 100000','Recursive DFS.',1,1,1000,256,1,4,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (16,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (16,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (16,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (16,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (16,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Level Order Traversal','Return level order nodes.','MEDIUM','Tree,BFS','1 <= n <= 100000','Use queue.',1,1,1000,256,1,5,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (17,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (17,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (17,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (17,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (17,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Lowest Common Ancestor','Find LCA in binary tree.','MEDIUM','Tree','1 <= n <= 100000','Recursive search.',1,1,1000,256,1,5,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (18,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (18,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (18,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (18,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (18,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Connected Components','Count graph components.','MEDIUM','Graph,DFS','1 <= n <= 100000','Visit all nodes.',1,1,1000,256,1,5,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (19,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (19,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (19,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (19,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (19,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Island Counter','Count islands in grid.','MEDIUM','Graph,BFS','1 <= n <= 100000','Flood fill.',1,1,1000,256,1,5,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (20,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (20,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (20,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (20,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (20,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Shortest Path Grid','Shortest path in matrix.','HARD','Graph,BFS','1 <= n <= 100000','Breadth-first search.',1,1,1000,256,1,6,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (21,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (21,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (21,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (21,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (21,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Climbing Ways','Ways to climb stairs.','EASY','DP','1 <= n <= 100000','Fibonacci relation.',1,1,1000,256,1,6,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (22,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (22,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (22,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (22,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (22,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Coin Combination Count','Count coin combinations.','MEDIUM','DP','1 <= n <= 100000','Unbounded knapsack.',1,1,1000,256,1,6,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (23,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (23,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (23,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (23,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (23,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Maximum Non Adjacent Sum','Max sum with no adjacent picks.','MEDIUM','DP','1 <= n <= 100000','House robber pattern.',1,1,1000,256,1,6,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (24,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (24,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (24,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (24,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (24,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
INSERT INTO problems
(title,statement,difficulty,tags,constraints,editorial,created_by,active,time_limit_ms,memory_limit_mb,category_id,subcategory_id,created_at,updated_at)
VALUES ('Activity Selection','Max non-overlapping activities.','EASY','Greedy','1 <= n <= 100000','Sort by finish time.',1,1,1000,256,1,7,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (25,'sample_input_1','sample_output_1',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (25,'sample_input_2','sample_output_2',1,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (25,'sample_input_3','sample_output_3',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (25,'sample_input_4','sample_output_4',0,20,256,1,NOW(),NOW());
INSERT INTO test_cases
(problem_id,input,expected_output,is_sample,score,memory_limit_mb,active,created_at,updated_at)
VALUES (25,'sample_input_5','sample_output_5',0,20,256,1,NOW(),NOW());
SET FOREIGN_KEY_CHECKS=1;