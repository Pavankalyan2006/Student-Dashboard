# Courses 1 to 35: Categories A, B, C

COURSES_A = [
    {
        "num": 1, "cat_key": "categoryA", "cat_name": "Programming Fundamentals",
        "title": "Programming Fundamentals with C", "code": "PRG101", "branch": "Common", "sem": 1, "diff": "Beginner", "mins": 540,
        "short_desc": "Master structured programming, memory layout, variables, conditionals, loops, functions, and arrays in C.",
        "desc": "An essential first course in computer programming using the ISO C standard. Covers low-level computer representation, procedural control structures, modular functions, stack frames, multi-dimensional arrays, and standard I/O library.",
        "skills": ["C Programming", "Variables & Types", "Control Structures", "Functions & Stack", "1D/2D Arrays"],
        "prereqs": ["None - Open to all engineering students"],
        "objectives": ["Write, compile, and debug standard C programs using GCC", "Understand primitive data types, binary representation, and operator precedence", "Implement modular code using functions, pass-by-value, and stack frames", "Manipulate single and multidimensional arrays with index bounds checking"],
        "thumb": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("C Foundations & Compilation Pipeline", "Preprocessing, compilation, assembly, and linking phases in GCC.", [
                ("Introduction to C & GCC Compilation Model", "Architecture of C, preprocessor directives, and translation units.", "CODE", "c"),
                ("Data Types, Variables & Memory Representation", "Signed/unsigned integers, IEEE-754 floats, type promotion, and limits.", "TEXT", "c"),
                ("Operators, Expressions & Bitwise Manipulation", "Arithmetic, logical, relational, and bitwise bit-shifting operations.", "CODE", "c"),
            ]),
            ("Control Flow & Iteration Structures", "Decision branching, loops, and loop control statements.", [
                ("Conditional Branching with If-Else & Switch", "Logical evaluation, nested conditionals, and switch-case jump tables.", "CODE", "c"),
                ("Looping Mechanisms: For, While & Do-While", "Iterative invariants, accumulator patterns, and nested loop iteration.", "CODE", "c"),
                ("Loop Optimization & Break/Continue Invariants", "Early loop termination, sentinel control, and avoiding infinite loops.", "TEXT", "c"),
            ]),
            ("Modular Functions & Execution Stack", "Procedural abstraction, call stack, parameters, and variable scope.", [
                ("Function Declarations, Definitions & Call Stacks", "Prototypes, activation records, call-by-value, and stack unwinding.", "CODE", "c"),
                ("Storage Classes & Variable Lifetimes", "auto, register, static, and extern linkage rules in translation units.", "TEXT", "c"),
                ("Recursion Fundamentals & Base Cases", "Recursive problem formulation, recurrence trees, and stack overflow guards.", "CODE", "c"),
            ]),
            ("Arrays & Sequential Data Structures", "Homogeneous contiguous data storage and multi-dimensional matrices.", [
                ("One-Dimensional Arrays & Memory Contiguity", "Array indexing, cache locality, bounds checking, and array traversals.", "CODE", "c"),
                ("Multidimensional Arrays & Matrix Operations", "Row-major memory layout, matrix addition, multiplication, and transposition.", "CODE", "c"),
                ("Searching & Sorting Arrays in C", "Linear search, binary search on sorted sequences, and bubble/insertion sort.", "CODE", "c"),
            ]),
        ]
    },
    {
        "num": 2, "cat_key": "categoryA", "cat_name": "Programming Fundamentals",
        "title": "Advanced C Programming", "code": "PRG102", "branch": "CSE", "sem": 2, "diff": "Intermediate", "mins": 600,
        "short_desc": "Deep dive into pointer arithmetic, dynamic memory, structs, function pointers, and system calls.",
        "desc": "Advanced procedural systems programming in C. Master raw pointer arithmetic, heap allocation (malloc/calloc/realloc/free), memory leaks, union packing, bitfields, function pointers for callbacks, and POSIX file descriptors.",
        "skills": ["Pointers & Addresses", "Dynamic Memory (Heap)", "Structs & Unions", "Function Pointers", "File I/O"],
        "prereqs": ["Programming Fundamentals with C"],
        "objectives": ["Master raw pointer arithmetic and multi-level indirection", "Manage heap memory safely and detect memory leaks with Valgrind", "Construct complex composite data structures using structs, bitfields, and unions", "Implement callback architectures with function pointers"],
        "thumb": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Pointers & Memory Architecture", "Addresses, dereferencing, pointer arithmetic, and void pointers.", [
                ("Pointer Basics & Address-Of Operations", "Memory addresses, pointer syntax, indirection, and void pointers.", "CODE", "c"),
                ("Pointer Arithmetic & Array Equivalences", "Pointer stepping, pointer subtraction, and array decaying to pointers.", "CODE", "c"),
                ("Double Pointers & Dynamic 2D Arrays", "Pointers to pointers, pointer arrays, and jagged heap allocations.", "CODE", "c"),
            ]),
            ("Dynamic Memory Allocation", "Managing heap memory safely with POSIX and standard allocators.", [
                ("Heap Allocation: malloc, calloc, realloc & free", "Heap allocation strategies, size calculations, and reallocation copying.", "CODE", "c"),
                ("Memory Leaks, Dangling Pointers & Valgrind", "Undefined behavior, use-after-free, double-free, and leak profiling.", "TEXT", "c"),
                ("Custom Memory Pools & Arena Allocators", "Fixed-block memory pools, bump allocators, and cache alignment.", "CODE", "c"),
            ]),
            ("Structures, Unions & Bitfields", "Composite user-defined data layouts and memory alignment.", [
                ("Struct Definition, Padding & Memory Alignment", "Field alignment, padding bytes, sizeof considerations, and offsetof.", "CODE", "c"),
                ("Unions, Tagged Unions & Endianness Detection", "Overlapping memory storage, type punning, and endian checks.", "CODE", "c"),
                ("Bitfields & Hardware Register Mapping", "Packing boolean flags into hardware bitfields and mask operations.", "CODE", "c"),
            ]),
            ("Function Pointers & File Systems", "Callback paradigms, function dispatch tables, and binary I/O.", [
                ("Function Pointers & Dynamic Dispatch Tables", "Declaring function pointer signatures, callbacks, and qsort comparator.", "CODE", "c"),
                ("Standard Stream I/O vs POSIX File Descriptors", "fopen, fread, fwrite vs open, read, write system calls.", "CODE", "c"),
                ("Preprocessor Macros, Variadic Functions & stdarg", "Variadic macros, va_list, va_start, va_arg, and token concatenation.", "CODE", "c"),
            ]),
        ]
    },
    {
        "num": 3, "cat_key": "categoryA", "cat_name": "Programming Fundamentals",
        "title": "Programming with C++", "code": "PRG103", "branch": "CSE", "sem": 2, "diff": "Intermediate", "mins": 620,
        "short_desc": "Modern C++ with RAII, STL containers, references, move semantics, smart pointers, and templates.",
        "desc": "Bridge procedural systems to object-oriented and generic paradigms with modern C++ (C++17/20). Emphasizes Resource Acquisition Is Initialization (RAII), standard template library (STL), value categories, move semantics, and generic templates.",
        "skills": ["Modern C++", "RAII", "STL Containers", "Smart Pointers", "Move Semantics", "Templates"],
        "prereqs": ["Programming Fundamentals with C"],
        "objectives": ["Apply RAII principles to guarantee deterministic resource deallocation", "Leverage Standard Template Library (vector, map, set, unordered_map) efficiently", "Understand lvalues, rvalues, std::move, and perfect forwarding", "Utilize std::unique_ptr and std::shared_ptr for modern memory safety"],
        "thumb": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("C++ Foundations & RAII", "Transitioning from C to C++ and managing resource lifecycles.", [
                ("Namespaces, References & Const-Correctness", "Passing by reference, const qualifiers, auto keyword, and namespaces.", "CODE", "cpp"),
                ("Constructors, Destructors & The Rule of 5", "Default constructors, copy/move constructors, and destructor cleanups.", "CODE", "cpp"),
                ("RAII Pattern & Deterministic Resource Management", "Wrapping file handles and mutexes inside scoped RAII classes.", "CODE", "cpp"),
            ]),
            ("Modern Memory Safety & Smart Pointers", "Replacing raw pointers with modern standard library wrappers.", [
                ("Unique Pointers & Exclusive Ownership", "std::unique_ptr, std::make_unique, and custom deleters.", "CODE", "cpp"),
                ("Shared & Weak Pointers", "Reference counting with std::shared_ptr and cyclic dependency breaks.", "CODE", "cpp"),
                ("Rvalue References & Move Semantics", "Value categories, std::move, move constructors, and zero-cost transfers.", "CODE", "cpp"),
            ]),
            ("Standard Template Library (STL)", "Core generic containers, iterators, and algorithms.", [
                ("Sequential Containers: Vector, Deque, List", "Vector reallocation amortized complexity and iterators.", "CODE", "cpp"),
                ("Associative & Hash Containers: Map & Unordered Map", "Red-black trees vs hash tables, custom hash functions, and lookups.", "CODE", "cpp"),
                ("STL Algorithms & Lambda Expressions", "std::sort, std::find_if, std::transform with modern C++ lambdas.", "CODE", "cpp"),
            ]),
            ("Generic Programming with Templates", "Writing type-agnostic algorithms and compile-time abstractions.", [
                ("Function Templates & Class Templates", "Template parameter deduction and multi-type template classes.", "CODE", "cpp"),
                ("Template Specialization & SFINAE Basics", "Explicit specialization, type traits, and enable_if concepts.", "CODE", "cpp"),
                ("Modern C++20 Concepts & Ranges", "Constraining template arguments with concepts and piping ranges.", "CODE", "cpp"),
            ]),
        ]
    },
    {
        "num": 4, "cat_key": "categoryA", "cat_name": "Programming Fundamentals",
        "title": "Java Programming Fundamentals", "code": "PRG104", "branch": "IT", "sem": 3, "diff": "Beginner", "mins": 560,
        "short_desc": "Java virtual machine (JVM), classes, objects, inheritance, polymorphism, and Java Collections.",
        "desc": "A comprehensive foundation in object-oriented programming with Java. Learn bytecode execution on the JVM, class hierarchies, interfaces, abstract classes, exception handling, string manipulation, and the Java Collections Framework.",
        "skills": ["Java Core", "JVM Architecture", "Inheritance", "Polymorphism", "Exception Handling", "Java Collections"],
        "prereqs": ["Basic Programming Concepts"],
        "objectives": ["Understand JVM architecture, bytecode compilation, and garbage collection", "Implement core OOP tenets: Encapsulation, Inheritance, and Polymorphism", "Handle checked and unchecked runtime exceptions robustly", "Utilize ArrayList, HashMap, and HashSet from Java Collections"],
        "thumb": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("JVM Architecture & Core Syntax", "Bytecode execution, memory areas, primitives, and operators.", [
                ("JVM, JRE, JDK & The Bytecode Execution Loop", "ClassLoaders, JIT compilation, method area, heap, and thread stacks.", "TEXT", "java"),
                ("Primitives, Wrappers & Type Casting", "Primitive memory footprints, autoboxing, unboxing, and numeric promotion.", "CODE", "java"),
                ("Control Statements & String Immutability", "Conditionals, switch expressions, String pool, and StringBuilder.", "CODE", "java"),
            ]),
            ("Object-Oriented Design in Java", "Classes, references, encapsulation, and inheritance.", [
                ("Classes, Objects & Constructors", "Instance variables, `this` reference, overloaded constructors, and garbage collection.", "CODE", "java"),
                ("Inheritance & Method Overriding", "`extends` keyword, `super` constructor chaining, and runtime virtual dispatch.", "CODE", "java"),
                ("Interfaces, Abstract Classes & Contracts", "Default interface methods, static methods, and interface vs abstract class.", "CODE", "java"),
            ]),
            ("Exception Handling & I/O", "Defensive programming with exceptions and modern stream processing.", [
                ("Checked vs Unchecked Exceptions", "try-catch-finally, multi-catch, throw, throws, and custom exceptions.", "CODE", "java"),
                ("Try-With-Resources & AutoCloseable", "Automatic resource management for sockets, files, and database connections.", "CODE", "java"),
                ("Java NIO & File Operations", "Paths, Files utility class, Buffers, Channels, and text file manipulation.", "CODE", "java"),
            ]),
            ("Java Collections Framework", "Generic data structures for enterprise software engineering.", [
                ("List Interface: ArrayList vs LinkedList", "Dynamic array resizing amortized cost vs doubly-linked node pointers.", "CODE", "java"),
                ("Set Interface: HashSet & TreeSet", "Hash distribution, collision resolution via chaining, and Red-Black tree sets.", "CODE", "java"),
                ("Map Interface: HashMap Internals", "Hash table buckets, treeification (TreeBins), load factor, and rehashing.", "CODE", "java"),
            ]),
        ]
    },
    {
        "num": 5, "cat_key": "categoryA", "cat_name": "Programming Fundamentals",
        "title": "Advanced Java Programming", "code": "PRG105", "branch": "IT", "sem": 4, "diff": "Advanced", "mins": 640,
        "short_desc": "Concurrency, multithreading, Java Streams, Reflection, Generics, and asynchronous CompletableFuture.",
        "desc": "Master enterprise-scale Java features. Explores the Java Memory Model (JMM), thread synchronization, locks, thread pools, CompletableFuture, Java 8+ Streams and Lambdas, Generics type erasure, and JVM garbage collection tuning.",
        "skills": ["Multithreading", "Concurrency API", "Java Streams", "CompletableFuture", "Generics & Reflection", "JVM Tuning"],
        "prereqs": ["Java Programming Fundamentals"],
        "objectives": ["Write thread-safe concurrent programs using synchronized, volatile, and locks", "Build high-throughput asynchronous pipelines with CompletableFuture", "Process massive datasets using Java Functional Streams and Lambdas", "Diagnose GC pauses and analyze JVM thread dumps"],
        "thumb": "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Java Concurrency & Thread Synchronization", "Thread lifecycles, memory visibility, and mutual exclusion.", [
                ("Thread Creation, States & Lifecycle", "Thread class, Runnable interface, thread pools, and worker threads.", "CODE", "java"),
                ("Synchronization Primitives & Volatile Keyword", "Monitors, synchronized blocks, wait/notify, and JMM happens-before rules.", "CODE", "java"),
                ("Explicit Locks & Concurrent Collections", "ReentrantLock, ReadWriteLock, ConcurrentHashMap, and CopyOnWriteArrayList.", "CODE", "java"),
            ]),
            ("Executor Framework & Asynchronous Pipelines", "Modern asynchronous execution in production environments.", [
                ("ExecutorService & ThreadPoolExecutors", "FixedThreadPool, CachedThreadPool, WorkStealingPool, and queue rejection.", "CODE", "java"),
                ("Callable, Future & CompletableFuture", "Composing asynchronous stages with thenApply, thenCompose, and allOf.", "CODE", "java"),
                ("Virtual Threads (Project Loom)", "High-throughput lightweight concurrency and carrier thread scheduling.", "CODE", "java"),
            ]),
            ("Functional Programming & Streams API", "Declarative pipeline processing and lambda calculus in Java.", [
                ("Functional Interfaces & Lambda Expressions", "Predicate, Consumer, Function, Supplier, and method references.", "CODE", "java"),
                ("Streams API: Intermediate & Terminal Operations", "Filter, map, flatMap, reduce, collect, and custom collectors.", "CODE", "java"),
                ("Parallel Streams & ForkJoinPool", "Parallel stream execution, spliterators, and overhead considerations.", "CODE", "java"),
            ]),
            ("Generics, Reflection & JVM Internals", "Metaprogramming and production runtime diagnostics.", [
                ("Generics Wildcards & Type Erasure", "Upper/lower bounded wildcards (? extends / ? super) and bridge methods.", "CODE", "java"),
                ("Java Reflection API & Dynamic Proxies", "Inspecting classes at runtime, invoking private methods, and proxy stubs.", "CODE", "java"),
                ("Garbage Collection Algorithms & JVM Profiling", "G1GC, ZGC, heap generations, visualVM monitoring, and GC log tuning.", "TEXT", "java"),
            ]),
        ]
    },
    {
        "num": 6, "cat_key": "categoryA", "cat_name": "Programming Fundamentals",
        "title": "Python Programming Fundamentals", "code": "PRG106", "branch": "Common", "sem": 1, "diff": "Beginner", "mins": 500,
        "short_desc": "Python syntax, dynamic typing, lists, tuples, dictionaries, file I/O, and modular programming.",
        "desc": "A foundational programming course in Python 3. Learn idiomatic Python programming, dynamic data types, sequence operations, list comprehensions, dictionary mappings, exception handling, and modular script development.",
        "skills": ["Python 3", "Data Structures", "List Comprehensions", "File Handling", "Modular Code"],
        "prereqs": ["None - Open to all engineering students"],
        "objectives": ["Write clean, PEP-8 compliant Python scripts", "Manipulate core data types: lists, tuples, sets, and dictionaries", "Use list and dictionary comprehensions for concise transformations", "Perform file reading, writing, and exception handling safely"],
        "thumb": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Python Core & Execution Model", "Interpreted language principles, bytecode, and fundamental syntax.", [
                ("Python Interpreter, Virtual Environments & REPL", "CPython execution, pyc bytecode, pip, and venv isolation.", "TEXT", "python"),
                ("Variables, Dynamic Typing & Numeric Types", "Integers with arbitrary precision, floats, booleans, and type conversion.", "CODE", "python"),
                ("String Manipulation, Slicing & Formatting", "f-strings, Unicode strings, string immutability, and slice indexing.", "CODE", "python"),
            ]),
            ("Control Flow & Idiomatic Iteration", "Branching, loops, and generator foundations.", [
                ("Conditional Logic & Boolean Operators", "Short-circuit evaluation, ternary expressions, and truthy/falsy values.", "CODE", "python"),
                ("While Loops, For Loops & range()", "Iterating over sequences, enumerate(), zip(), and loop else clauses.", "CODE", "python"),
                ("Break, Continue & Loop Control Invariants", "Sentinel loops, early exits, and loop invariants.", "CODE", "python"),
            ]),
            ("Data Structures & Comprehensions", "Mastering Python's built-in container ecosystem.", [
                ("Lists & Tuples: Mutability vs Immutability", "Dynamic array amortized append, tuple packing/unpacking, and slicing.", "CODE", "python"),
                ("Dictionaries & Hash Maps", "Hash tables, key hashing, dict views, and default dict implementations.", "CODE", "python"),
                ("Sets & Comprehensions", "Set operations, mathematical unions/intersections, and comprehension syntax.", "CODE", "python"),
            ]),
            ("Functions, Modules & File I/O", "Reusable program construction and persistent storage.", [
                ("Function Arguments: *args, **kwargs & Scope", "Positional-only, keyword-only args, LEGB scope resolution rules.", "CODE", "python"),
                ("File I/O Context Managers & with Statement", "Opening files, reading lines, json serialization, and automatic closing.", "CODE", "python"),
                ("Exception Handling & Custom Exceptions", "try-except-else-finally blocks and inheriting from Exception.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 7, "cat_key": "categoryA", "cat_name": "Programming Fundamentals",
        "title": "Advanced Python Programming", "code": "PRG107", "branch": "AIML", "sem": 3, "diff": "Advanced", "mins": 620,
        "short_desc": "Generators, decorators, context managers, metaclasses, asyncio, and multiprocessing in CPython.",
        "desc": "Master production-grade Python engineering. Delves into the Global Interpreter Lock (GIL), dunder methods, generator state machines, custom decorators, context managers, asynchronous event loops with asyncio, and multiprocessing.",
        "skills": ["Decorators", "Generators & Yield", "Asyncio", "Multiprocessing", "Dunder Methods", "GIL Internals"],
        "prereqs": ["Python Programming Fundamentals"],
        "objectives": ["Implement custom function and class decorators with parameter forwarding", "Build lazy evaluation streaming pipelines with generator functions", "Write non-blocking asynchronous network clients using asyncio", "Bypass GIL constraints for CPU-bound tasks using multiprocessing"],
        "thumb": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Advanced Functions & Decorators", "Higher-order functions, closures, and metaprogramming decorators.", [
                ("Closures & First-Class Function Objects", "Lexical scoping, closure cell variables, and function introspection.", "CODE", "python"),
                ("Function Decorators with functools.wraps", "Timing decorators, caching/memoization, and preserving function metadata.", "CODE", "python"),
                ("Parameterized & Class Decorators", "Decorator factories, decorating class methods, and stateful decorators.", "CODE", "python"),
            ]),
            ("Generators, Iterators & Context Managers", "Lazy evaluation, memory-efficient streams, and protocol implementations.", [
                ("Iterator Protocol & Custom Iterators", "__iter__ and __next__ dunder methods and StopIteration signalling.", "CODE", "python"),
                ("Generators & Coroutines with yield", "Yield expressions, generator pipelines, and yield from delegation.", "CODE", "python"),
                ("Context Managers & contextlib", "The context management protocol (__enter__, __exit__) and @contextmanager.", "CODE", "python"),
            ]),
            ("Object Model & Metaprogramming", "Inspecting and altering Python class creation at runtime.", [
                ("Dunder Magic Methods & Operator Overloading", "__str__, __repr__, __eq__, __hash__, and custom arithmetic dunders.", "CODE", "python"),
                ("Descriptors & Property Decorators", "__get__, __set__, and __delete__ protocol for attribute interception.", "CODE", "python"),
                ("Metaclasses & type.__new__", "Custom type construction, enforcing class contracts, and abstract base classes.", "CODE", "python"),
            ]),
            ("Concurrency: Asyncio & Multiprocessing", "Asynchronous event loops and parallel compute across cores.", [
                ("The Global Interpreter Lock (GIL) Architecture", "GIL mechanisms, thread switching, I/O bound vs CPU bound trade-offs.", "TEXT", "python"),
                ("Asynchronous I/O with Asyncio", "Event loops, coroutines, tasks, asyncio.gather, and non-blocking I/O.", "CODE", "python"),
                ("Multiprocessing & ProcessPoolExecutor", "Spawning child processes, shared memory, pipes, and CPU parallel scaling.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 8, "cat_key": "categoryA", "cat_name": "Programming Fundamentals",
        "title": "Object-Oriented Programming", "code": "PRG108", "branch": "CSE", "sem": 3, "diff": "Intermediate", "mins": 580,
        "short_desc": "Object-oriented design patterns, SOLID principles, encapsulation, polymorphism, and UML modeling.",
        "desc": "A foundational software engineering course on Object-Oriented Analysis and Design (OOAD). Emphasizes the SOLID design principles, GoF design patterns (creational, structural, behavioral), coupling vs cohesion, and robust architectural modeling.",
        "skills": ["SOLID Principles", "Design Patterns", "UML Class Diagrams", "Polymorphism", "Decoupling"],
        "prereqs": ["Programming in C++, Java, or Python"],
        "objectives": ["Apply the 5 SOLID design principles to eliminate rigid and fragile code", "Implement Gang of Four design patterns: Factory, Singleton, Strategy, Observer", "Design extensible architectures using composition over inheritance", "Model real-world enterprise systems using UML class and sequence diagrams"],
        "thumb": "https://images.unsplash.com/photo-1550439022-d09c86be9908?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Core Object-Oriented Principles", "The four pillars and structural coupling.", [
                ("Encapsulation & Information Hiding", "Access specifiers, public interfaces, internal invariants, and mutator safety.", "CODE", "cpp"),
                ("Inheritance vs Object Composition", "Liskov substitutability, fragile base class problem, and 'has-a' design.", "CODE", "cpp"),
                ("Polymorphism & Dynamic Dispatch", "Virtual function tables (vtable), dynamic binding, and interface contracts.", "CODE", "cpp"),
            ]),
            ("The SOLID Architectural Principles", "Writing maintainable, loosely coupled, and open architectures.", [
                ("Single Responsibility & Open/Closed Principles", "Cohesion metrics and extending classes without modifying existing code.", "CODE", "java"),
                ("Liskov Substitution & Interface Segregation", "Behavioral subtyping, avoiding fat interfaces, and client isolation.", "CODE", "java"),
                ("Dependency Inversion & Inversion of Control", "Decoupling high-level modules from low-level implementations with interfaces.", "CODE", "java"),
            ]),
            ("Creational & Structural Patterns", "Proven solutions for object instantiation and composition.", [
                ("Singleton & Factory Method Patterns", "Thread-safe singleton patterns, factory encapsulation, and virtual creation.", "CODE", "java"),
                ("Builder & Prototype Patterns", "Constructing complex objects step-by-step and shallow vs deep cloning.", "CODE", "java"),
                ("Adapter, Decorator & Facade Patterns", "Interface transformation, dynamic behavior wrapping, and subsystem facades.", "CODE", "java"),
            ]),
            ("Behavioral Patterns & UML Modeling", "Inter-object communication protocols and visual software architecture.", [
                ("Strategy & Observer Patterns", "Interchangeable runtime algorithms and publish-subscribe event dispatchers.", "CODE", "java"),
                ("Command & State Patterns", "Encapsulating requests as objects and finite state machine transitions.", "CODE", "java"),
                ("UML Modeling: Class & Sequence Diagrams", "Representing associations, aggregations, dependencies, and execution lifelines.", "TEXT", "text"),
            ]),
        ]
    },
    {
        "num": 9, "cat_key": "categoryA", "cat_name": "Programming Fundamentals",
        "title": "Data Structures Fundamentals", "code": "PRG109", "branch": "CSE", "sem": 3, "diff": "Intermediate", "mins": 660,
        "short_desc": "Linear and non-linear data structures: Linked lists, stacks, queues, trees, heaps, and hash tables.",
        "desc": "The cornerstone course of Computer Science. Learn the theoretical properties, asymptotic memory/time trade-offs, and practical implementations of dynamic arrays, singly and doubly linked lists, stacks, queues, binary search trees, and heaps.",
        "skills": ["Linked Lists", "Stacks & Queues", "Binary Trees", "Heaps & Priority Queues", "Hash Tables"],
        "prereqs": ["Programming Fundamentals (C or C++)"],
        "objectives": ["Implement linked lists, stacks, and circular queues from scratch in memory", "Understand push, pop, enqueue, and dequeue invariants in O(1) time", "Construct Binary Search Trees and execute in-order, pre-order, and post-order traversals", "Build Min-Heaps and Max-Heaps for priority queue operations"],
        "thumb": "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Linear Data Structures: Lists", "Node-based sequential memory structures.", [
                ("Singly Linked List Implementation", "Node pointers, head insertion, tail insertion, and element deletion.", "CODE", "cpp"),
                ("Doubly & Circular Linked Lists", "Bidirectional traversal, sentinel dummy nodes, and ring buffers.", "CODE", "cpp"),
                ("Fast & Slow Pointer Techniques", "Cycle detection (Floyd's algorithm), middle node finding, and list reversal.", "CODE", "cpp"),
            ]),
            ("Stacks & Queues", "LIFO and FIFO restricted-access sequential data structures.", [
                ("Stack Implementation & Infix-to-Postfix", "Array and list-based stacks, balancing brackets, and expression evaluation.", "CODE", "cpp"),
                ("Monotonic Stacks & Next Greater Element", "Maintaining monotonic ordering for O(n) lookahead problems.", "CODE", "cpp"),
                ("Queues & Circular Queue Ring Buffers", "FIFO mechanics, circular array wrapping, and BFS queue operations.", "CODE", "cpp"),
            ]),
            ("Trees & Hierarchical Structures", "Non-linear node hierarchies and binary tree traversal algorithms.", [
                ("Binary Trees: Traversals & Height Properties", "Pre-order, in-order, post-order, and level-order BFS traversals.", "CODE", "cpp"),
                ("Binary Search Trees (BST) & Invariants", "Search, insertion, deletion with in-order successor, and validation.", "CODE", "cpp"),
                ("Balanced BSTs: AVL Tree Rotations", "Height balance factors, LL, RR, LR, RL single and double rotations.", "CODE", "cpp"),
            ]),
            ("Heaps & Hash Tables", "Priority queuing and fast dictionary lookups.", [
                ("Binary Heap & Priority Queues", "Array representation of binary trees, heapify up/down, and extract-max.", "CODE", "cpp"),
                ("Hash Tables & Collision Resolution", "Hash functions, separate chaining, open addressing (linear probing), and load factor.", "CODE", "cpp"),
                ("Trie (Prefix Tree) Data Structure", "String prefix search, insert, and search complexity O(L).", "CODE", "cpp"),
            ]),
        ]
    },
    {
        "num": 10, "cat_key": "categoryA", "cat_name": "Programming Fundamentals",
        "title": "Algorithms and Problem Solving", "code": "PRG110", "branch": "CSE", "sem": 4, "diff": "Intermediate", "mins": 680,
        "short_desc": "Algorithmic paradigms: Divide and conquer, greedy heuristics, dynamic programming, and backtracking.",
        "desc": "Systematic algorithmic problem solving for software engineers. Master recurrence relations, Master Theorem, greedy choice property, memoization, 2D dynamic programming, backtracking state exploration, and graph traversal algorithms.",
        "skills": ["Divide & Conquer", "Greedy Algorithms", "Dynamic Programming", "Backtracking", "Graph Search"],
        "prereqs": ["Data Structures Fundamentals"],
        "objectives": ["Solve recurrences using Master Theorem and recursion tree models", "Identify optimal substructure and overlapping subproblems for Dynamic Programming", "Implement greedy algorithms with mathematical exchange arguments", "Formulate backtracking solutions for constraint satisfaction problems"],
        "thumb": "https://images.unsplash.com/photo-1516116211227-bbc0c25a07c3?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Divide-and-Conquer Algorithms", "Breaking problems into independent subproblems.", [
                ("Master Theorem & Recurrence Analysis", "Analyzing T(n) = aT(n/b) + f(n) across three asymptotic cases.", "TEXT", "text"),
                ("Merge Sort & Inversion Counting", "Recursive sorting, stable two-way merging, and count inversions.", "CODE", "cpp"),
                ("Quick Sort & QuickSelect (Median Finding)", "Hoare vs Lomuto partitioning, pivot choices, and O(n) average selection.", "CODE", "cpp"),
            ]),
            ("Greedy Algorithms & Heuristics", "Locally optimal choices yielding globally optimal results.", [
                ("Greedy Choice Property & Proof by Exchange", "Exchange arguments, activity selection, and fractional knapsack.", "CODE", "cpp"),
                ("Huffman Coding & Data Compression", "Frequency priority queues, prefix-free binary tree construction, and encoding.", "CODE", "cpp"),
                ("Interval Scheduling & Minimum Spanning Trees", "Interval coloring, Kruskal's algorithm with Disjoint Set Union (DSU).", "CODE", "cpp"),
            ]),
            ("Dynamic Programming Foundations", "Optimal substructure and memoization strategies.", [
                ("Memoization vs Tabulation: 1D DP", "Fibonacci, climbing stairs, house robber, and state transitions.", "CODE", "cpp"),
                ("0/1 Knapsack Problem & Subset Sum", "2D table formulation, space optimization to 1D, and pseudo-polynomial time.", "CODE", "cpp"),
                ("Longest Common Subsequence (LCS) & Edit Distance", "String alignment, Levenshtein operations, and backtracking the path.", "CODE", "cpp"),
            ]),
            ("Backtracking & Search Optimization", "Exploring decision state spaces with pruning.", [
                ("Backtracking Framework: Permutations & Subsets", "State space trees, recursive decisions, and undoing state.", "CODE", "cpp"),
                ("N-Queens & Sudoku Solver", "Constraint validation, bitmask optimizations, and early branch pruning.", "CODE", "cpp"),
                ("Graph BFS & DFS: Connected Components & Bipartite", "Depth-first search, cycle detection, bipartite testing with 2-coloring.", "CODE", "cpp"),
            ]),
        ]
    },
]

COURSES_B = [
    {
        "num": 11, "cat_key": "categoryB", "cat_name": "Web Development",
        "title": "HTML and Semantic Web", "code": "WEB101", "branch": "IT", "sem": 2, "diff": "Beginner", "mins": 450,
        "short_desc": "Modern HTML5 semantic architecture, accessible web standards (WAI-ARIA), forms, and SEO metadata.",
        "desc": "Master the document object structure and semantic foundation of the World Wide Web. Learn HTML5 structural landmarks, web accessibility compliance, screen reader support, accessible rich internet applications (ARIA), and SEO meta schemas.",
        "skills": ["HTML5 Semantics", "Web Accessibility (A11y)", "WAI-ARIA", "Responsive Forms", "SEO Meta Tags"],
        "prereqs": ["None - Open to all engineering students"],
        "objectives": ["Build accessible web page structures with HTML5 semantic elements", "Implement WCAG 2.1 compliant web layouts with ARIA attributes", "Design robust, accessible web forms with native HTML5 validation", "Structure open-graph and JSON-LD schema metadata for search engine indexing"],
        "thumb": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Semantic Architecture & Document Models", "DOM trees, landmarks, and semantic tags.", [
                ("HTML5 Document Anatomy & The DOM Tree", "Doctype, head, body, script parsing modes (defer vs async), and DOM nodes.", "TEXT", "html"),
                ("Semantic Structural Landmarks", "header, nav, main, article, section, aside, footer, and outline algorithm.", "CODE", "html"),
                ("Text Semantics & Typography Hierarchy", "Heading hierarchy, blockquote, figure/figcaption, code, time, and marks.", "CODE", "html"),
            ]),
            ("Accessible Web & WAI-ARIA Standards", "Designing for assistive technology and universal usability.", [
                ("Accessibility Fundamentals & WCAG 2.1 Guidelines", "Perceivable, Operable, Understandable, Robust (POUR) principles.", "TEXT", "html"),
                ("ARIA Roles, States & Live Regions", "role='dialog', aria-live, aria-expanded, aria-hidden, and keyboard focus.", "CODE", "html"),
                ("Color Contrast & Keyboard Navigation Tabindex", "Focus rings, skip navigation links, tabindex 0 vs -1, and keyboard traps.", "CODE", "html"),
            ]),
            ("Advanced Web Forms & Client Validation", "Capturing structured user inputs with native browser validation.", [
                ("Form Controls & Input Types", "email, tel, date, range, file inputs with accept attributes, and datalists.", "CODE", "html"),
                ("Native HTML5 Validation & Regular Expressions", "pattern regex, required, min/max, step, and custom validity states.", "CODE", "html"),
                ("Accessible Form Association & Labels", "Explicit label binding (for/id), fieldset, legend, and aria-describedby errors.", "CODE", "html"),
            ]),
            ("Multimedia, SEO & Structured Data", "Embedding rich media and search metadata.", [
                ("Responsive Images: srcset & picture Element", "Resolution switching, art direction, WebP/AVIF formats, and lazy loading.", "CODE", "html"),
                ("Audio, Video & Web VTT Subtitle Tracks", "HTMLMediaElement API, codecs, preload strategies, and accessibility captions.", "CODE", "html"),
                ("SEO Metadata & OpenGraph / JSON-LD Schemas", "Meta robots, canonical links, OpenGraph tags, and Schema.org rich snippets.", "CODE", "html"),
            ]),
        ]
    },
    {
        "num": 12, "cat_key": "categoryB", "cat_name": "Web Development",
        "title": "CSS and Responsive Web Design", "code": "WEB102", "branch": "IT", "sem": 2, "diff": "Beginner", "mins": 520,
        "short_desc": "CSS Box Model, Flexbox, CSS Grid layouts, media queries, CSS variables, and fluid typography.",
        "desc": "Create visually stunning and adaptive web interfaces. Master the CSS cascade, specificity hierarchy, box model calculations, one-dimensional Flexbox, two-dimensional CSS Grid systems, container queries, and GPU-accelerated micro-animations.",
        "skills": ["CSS3 Box Model", "Flexbox Layout", "CSS Grid", "Media Queries", "Container Queries", "CSS Animations"],
        "prereqs": ["HTML and Semantic Web"],
        "objectives": ["Resolve cascade specificity and stacking context bugs with confidence", "Construct complex 2D responsive application layouts using CSS Grid and Flexbox", "Implement mobile-first fluid responsive layouts across device breakpoints", "Craft smooth 60fps micro-animations using GPU-accelerated transforms and transitions"],
        "thumb": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("CSS Foundations, Specificity & Box Model", "The cascade engine, computed styles, and dimensional math.", [
                ("The Cascade, Specificity & Inheritance Hierarchy", "Calculation of specificity weights, origin layers (@layer), and !important.", "TEXT", "css"),
                ("The Box Model: Content-Box vs Border-Box", "Margin collapse, padding, borders, box-sizing, and outline offsets.", "CODE", "css"),
                ("CSS Custom Properties & Dynamic Theming", "Declaring CSS variables (--primary), variable inheritance, and dark mode toggles.", "CODE", "css"),
            ]),
            ("Flexbox: One-Dimensional Layouts", "Flex containers, axis alignments, and content distribution.", [
                ("Flex Containers: Main Axis & Cross Axis", "display: flex, flex-direction, justify-content, and align-items.", "CODE", "css"),
                ("Flex Items: Growth, Shrinkage & Basis Math", "flex-grow, flex-shrink, flex-basis sizing formula, and min-width caveats.", "CODE", "css"),
                ("Complex Flex Navigation Bars & Card Grids", "Wrapping flex rows, auto margins for push elements, and alignment tricks.", "CODE", "css"),
            ]),
            ("CSS Grid: Two-Dimensional Grid Systems", "Orchestrating layout rows, columns, and templates.", [
                ("Grid Tracks, Fr Units & Implicit Grids", "grid-template-columns, fr fractions, repeat(), minmax(), and auto-fill/fit.", "CODE", "css"),
                ("Named Grid Areas & Template Layouts", "grid-template-areas, grid-area assignments, and visual page layout mapping.", "CODE", "css"),
                ("Subgrid & Advanced Grid Alignments", "display: subgrid, gap spacing, dense packing, and overlapping elements.", "CODE", "css"),
            ]),
            ("Responsive Systems, Transitions & Animation", "Adaptive viewport scaling and high-performance motion.", [
                ("Mobile-First Media Queries & Container Queries", "min-width breakpoints, clamp() fluid typography, and @container rules.", "CODE", "css"),
                ("Transitions & Cubic-Bezier Timing Functions", "transition property, ease-in-out curves, and state pseudo-classes.", "CODE", "css"),
                ("CSS Keyframe Animations & Hardware Acceleration", "@keyframes, transform, opacity, will-change, and 60fps compositor layers.", "CODE", "css"),
            ]),
        ]
    },
    {
        "num": 13, "cat_key": "categoryB", "cat_name": "Web Development",
        "title": "JavaScript Fundamentals", "code": "WEB103", "branch": "CSE", "sem": 3, "diff": "Beginner", "mins": 560,
        "short_desc": "Modern ES6+ JavaScript, Event Loop, closures, asynchronous Promises, and DOM manipulation.",
        "desc": "The definitive foundation for dynamic web development. Covers ECMAScript 6+ language specifications, lexical scope, closures, prototype inheritance, event propagation (bubbling and capturing), Promise chains, and async/await syntax.",
        "skills": ["JavaScript ES6+", "DOM Manipulation", "Event Loop", "Closures", "Promises", "Async/Await"],
        "prereqs": ["HTML and Semantic Web", "Programming Fundamentals"],
        "objectives": ["Master modern ES6+ syntax: destructuring, rest/spread, arrow functions, and modules", "Understand execution contexts, hoisting, scope chain, and closures in depth", "Manipulate the browser DOM dynamically and handle event delegation", "Write asynchronous non-blocking JavaScript using Promises and async/await"],
        "thumb": "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("JavaScript Core Engine & Execution Context", "Call stacks, variable environments, and hoisting mechanics.", [
                ("Execution Context, Call Stack & Hoisting", "Creation phase, execution phase, TDZ (Temporal Dead Zone) of let/const.", "TEXT", "javascript"),
                ("Primitive Types vs Object References", "Call-by-sharing, shallow vs deep object cloning (structuredClone), and immutability.", "CODE", "javascript"),
                ("Lexical Scope & Closures in Depth", "Outer lexical environments, state encapsulation, and closure memory retention.", "CODE", "javascript"),
            ]),
            ("Modern ES6+ Features & Functional Methods", "Writing expressive, concise, and immutable JavaScript.", [
                ("Arrow Functions, Default Parameters & Rest/Spread", "Lexical `this` binding in arrows, spread operator for arrays and objects.", "CODE", "javascript"),
                ("Destructuring & Optional Chaining", "Object/array destructuring, default values, nullish coalescing (??), and ?.", "CODE", "javascript"),
                ("Array Iteration: Map, Filter, Reduce & FlatMap", "Pure functional transformations, accumulators, and method chaining.", "CODE", "javascript"),
            ]),
            ("DOM Manipulation & Browser Events", "Interfacing with the web browser document model.", [
                ("DOM Queries, Traversal & Node Manipulation", "querySelector, createElement, appendChild, classList, and DocumentFragment.", "CODE", "javascript"),
                ("Event Propagation: Capturing, Target & Bubbling", "addEventListener phases, e.stopPropagation(), and event delegation patterns.", "CODE", "javascript"),
                ("Form Handling, FormData & Browser Storage", "e.preventDefault(), FormData API, localStorage, and sessionStorage.", "CODE", "javascript"),
            ]),
            ("Asynchronous JavaScript & The Event Loop", "Non-blocking concurrency in single-threaded V8.", [
                ("The Event Loop, Microtasks & Macrotasks", "V8 task queues, process.nextTick, Promise microtasks, and setTimeout macrotasks.", "TEXT", "javascript"),
                ("Promises: Chaining, States & Error Catching", "new Promise(), then/catch/finally, Promise.all, Promise.allSettled, race.", "CODE", "javascript"),
                ("Async/Await Syntax & Fetch API", "Consuming REST APIs, try/catch error handling, and aborting with AbortController.", "CODE", "javascript"),
            ]),
        ]
    },
    {
        "num": 14, "cat_key": "categoryB", "cat_name": "Web Development",
        "title": "Advanced JavaScript", "code": "WEB104", "branch": "CSE", "sem": 4, "diff": "Advanced", "mins": 620,
        "short_desc": "Prototype chains, V8 engine internals, memory management, Web Workers, Proxy, and Reflect API.",
        "desc": "Explore advanced ECMAScript runtime mechanics and metaprogramming. Deep dive into V8 JIT compilation (Ignition and TurboFan), hidden classes, memory leaks, prototypal inheritance internals, Proxy and Reflect metaprogramming, and Web Workers.",
        "skills": ["Prototypes & __proto__", "V8 Engine Internals", "Memory Profiling", "Proxies & Reflect", "Web Workers", "Iterators & Symbols"],
        "prereqs": ["JavaScript Fundamentals"],
        "objectives": ["Understand prototype chains, Object.create, and ES6 class desugaring", "Profile and eliminate JavaScript memory leaks using Chrome DevTools heap snapshots", "Intercept and customize object behavior using Proxy and Reflect", "Offload intensive computation from the main thread using Web Workers"],
        "thumb": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Prototypes & Inheritance Internals", "The mechanical backbone of JavaScript object design.", [
                ("Prototypal Inheritance vs Classical Inheritance", "Prototype chains, [[Prototype]], Object.prototype, and prototype pollution.", "CODE", "javascript"),
                ("Object.create & Constructor Functions", "new operator mechanics, setting prototype links, and instanceOf checks.", "CODE", "javascript"),
                ("ES6 Classes Desugaring & Private Fields", "class keyword under the hood, super keyword, and private #field hash storage.", "CODE", "javascript"),
            ]),
            ("V8 Engine Architecture & Performance", "How the browser executes JavaScript at bare-metal speeds.", [
                ("V8 Pipeline: Ignition Interpreter & TurboFan JIT", "Bytecode generation, feedback vector, optimization, and deoptimization.", "TEXT", "javascript"),
                ("Hidden Classes, Inline Caches & Shape Polymorphism", "Property access optimization, monomorphic vs polymorphic call sites.", "TEXT", "javascript"),
                ("Memory Allocation & Garbage Collection (Orinoco)", "Generational garbage collection, Scavenge nursery, and Mark-Sweep-Compact.", "TEXT", "javascript"),
            ]),
            ("Metaprogramming: Proxy, Reflect & Symbols", "Altering fundamental language operations dynamically.", [
                ("Symbols & Well-Known Symbol Protocols", "Symbol.iterator, Symbol.toPrimitive, Symbol.hasInstance, and private keys.", "CODE", "javascript"),
                ("The Proxy API: Intercepting Traps", "get, set, has, deleteProperty traps, and building reactive observable stores.", "CODE", "javascript"),
                ("Reflect API & Forwarding Default Behavior", "Reflect methods matching Proxy traps and safer object property manipulation.", "CODE", "javascript"),
            ]),
            ("Concurrency, Multi-Threading & Streams", "Extending single-threaded JavaScript across threads.", [
                ("Web Workers & PostMessage Serialization", "Dedicated workers, structural cloning algorithm, and parallel data crunching.", "CODE", "javascript"),
                ("SharedArrayBuffer & Atomics Operations", "Shared thread memory, atomic locks, race conditions, and compareExchange.", "CODE", "javascript"),
                ("ReadableStream & WritableStream API", "Streaming network responses chunk-by-chunk and backpressure handling.", "CODE", "javascript"),
            ]),
        ]
    },
    {
        "num": 15, "cat_key": "categoryB", "cat_name": "Web Development",
        "title": "TypeScript Fundamentals", "code": "WEB105", "branch": "CSE", "sem": 4, "diff": "Intermediate", "mins": 580,
        "short_desc": "Static typing for JavaScript: Interfaces, Generics, Union/Intersection types, Narrowing, and utility types.",
        "desc": "Scale JavaScript applications with static type safety. Learn the TypeScript compiler (tsc), structural type system, discriminated unions, control flow type narrowing, generics, conditional types, mapped types, and tsconfig compiler options.",
        "skills": ["TypeScript Core", "Generics", "Type Narrowing", "Discriminated Unions", "Mapped Types", "Compiler Options"],
        "prereqs": ["JavaScript Fundamentals"],
        "objectives": ["Write type-safe scalable JavaScript applications with compile-time verification", "Design flexible generic components, functions, and interfaces", "Utilize discriminated unions and custom type guards for exhaustive type narrowing", "Construct advanced utility types using mapped and conditional types"],
        "thumb": "https://images.unsplash.com/photo-1516116211227-bbc0c25a07c3?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("TypeScript Foundations & Basic Types", "Type inference, annotations, and structural typing.", [
                ("TypeScript Compiler & tsconfig.json Options", "strict mode, target ECMAScript versions, module resolution, and declaration files.", "TEXT", "typescript"),
                ("Primitive Types, Arrays, Tuples & Enums", "Type annotations vs inference, readonly arrays, fixed-length tuples, enums.", "CODE", "typescript"),
                ("Type Aliases vs Interfaces & Declaration Merging", "Object shapes, extends keyword, index signatures, and interface merging.", "CODE", "typescript"),
            ]),
            ("Type System Mechanics & Narrowing", "Structural compatibility and runtime type analysis.", [
                ("Structural Typing ('Duck Typing') & Excess Property Checks", "Shape compatibility, literal assignment quirks, and width subtyping.", "CODE", "typescript"),
                ("Union Types, Intersection Types & Literal Types", "Composing types with | and &, string literal types, and keyof operator.", "CODE", "typescript"),
                ("Type Narrowing & Discriminated Unions", "typeof, instanceof, in operator, custom type predicates (is), and tagged unions.", "CODE", "typescript"),
            ]),
            ("Generics & Polymorphic Code", "Writing reusable code across multiple data types.", [
                ("Generic Functions & Interfaces", "Generic type parameters, multi-type generics, and default type arguments.", "CODE", "typescript"),
                ("Generic Constraints with extends", "Constraining type parameters (T extends { id: string }) and keyof lookups.", "CODE", "typescript"),
                ("Generic Classes & Data Structures", "Building a type-safe generic Stack, Queue, and Repository class.", "CODE", "typescript"),
            ]),
            ("Advanced Types & Utility Transformations", "Compile-time metaprogramming with TypeScript.", [
                ("Utility Types: Partial, Pick, Omit, Record & Readonly", "Standard library transformations and immutable object models.", "CODE", "typescript"),
                ("Mapped Types & Template Literal Types", "Iterating over keys with in keyof, modifier flags (+/-), and string template types.", "CODE", "typescript"),
                ("Conditional Types & infer Keyword", "T extends U ? X : Y expressions, flattening arrays, and ReturnType<T> implementation.", "CODE", "typescript"),
            ]),
        ]
    },
    {
        "num": 16, "cat_key": "categoryB", "cat_name": "Web Development",
        "title": "React.js Development", "code": "WEB106", "branch": "CSE", "sem": 5, "diff": "Intermediate", "mins": 640,
        "short_desc": "React 19 component architecture, Hooks, Virtual DOM, state management, and performance optimization.",
        "desc": "Build modern single-page applications with React. Covers JSX compilation, component lifecycles, useState, useEffect dependency arrays, custom hooks, React context, React.memo, useCallback/useMemo optimization, and TanStack React Query.",
        "skills": ["React 19", "Hooks (useState, useEffect)", "Custom Hooks", "Context API", "React Optimization", "Component Architecture"],
        "prereqs": ["JavaScript Fundamentals", "TypeScript Fundamentals"],
        "objectives": ["Deconstruct UI designs into composable, reusable React components", "Master the Rules of Hooks and manage local component state effortlessly", "Build custom hooks to encapsulate reusable stateful business logic", "Eliminate unnecessary re-renders using React.memo, useMemo, and useCallback"],
        "thumb": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("React Foundations & Virtual DOM", "Declarative UI rendering and JSX compilation.", [
                ("JSX Architecture, React Fiber & Reconciliation", "JSX transpilation, virtual DOM diffing, keys in lists, and Fiber node tree.", "TEXT", "tsx"),
                ("Functional Components, Props & Children", "Props immutability, destructuring, default props, and children prop composition.", "CODE", "tsx"),
                ("Conditional Rendering & List Mapping", "Ternary expressions, logical && guards, and stable list item keys.", "CODE", "tsx"),
            ]),
            ("Core React Hooks & Lifecycles", "Stateful components and side-effect synchronization.", [
                ("useState & Functional State Updates", "State setter queuing, batching, and updater functions (prev => prev + 1).", "CODE", "tsx"),
                ("useEffect: Synchronization & Cleanup Functions", "Dependency arrays, avoiding infinite loops, and socket/timer cleanup.", "CODE", "tsx"),
                ("useRef & Imperative DOM Access", "Mutable instance variables across renders and attaching ref to input nodes.", "CODE", "tsx"),
            ]),
            ("Advanced Hooks & Global State Management", "Sharing state and encapsulating complex logic.", [
                ("useReducer for Complex State Machines", "Actions, reducer pure functions, and structured multi-field state changes.", "CODE", "tsx"),
                ("React Context API & Prop Drilling Solutions", "createContext, Context.Provider, useContext, and context performance splits.", "CODE", "tsx"),
                ("Authoring Custom React Hooks", "Extracting reusable logic: useFetch, useLocalStorage, and useDebounce.", "CODE", "tsx"),
            ]),
            ("Performance Optimization & Modern Patterns", "Building lightning-fast, production-ready React apps.", [
                ("React.memo, useMemo & useCallback", "Referential equality, caching expensive calculations, and callback stability.", "CODE", "tsx"),
                ("Code Splitting with React.lazy & Suspense", "Dynamic imports, route-based splitting, and fallback loading boundaries.", "CODE", "tsx"),
                ("Server State with TanStack React Query", "Query caching, automatic refetching, mutation states, and optimistic updates.", "CODE", "tsx"),
            ]),
        ]
    },
    {
        "num": 17, "cat_key": "categoryB", "cat_name": "Web Development",
        "title": "Node.js and Express", "code": "WEB107", "branch": "IT", "sem": 5, "diff": "Intermediate", "mins": 600,
        "short_desc": "Server-side JavaScript: Node.js runtime, Express routing, middleware chain, authentication, and error handling.",
        "desc": "Architect high-performance backend microservices with Node.js and Express. Master the Libuv thread pool, non-blocking I/O, middleware pipelines, routing architectures, request validation, JWT authentication, and centralized error handling.",
        "skills": ["Node.js Runtime", "Express.js", "Middleware Chains", "JWT Authentication", "REST Routing", "Libuv Architecture"],
        "prereqs": ["JavaScript Fundamentals"],
        "objectives": ["Understand Node.js architecture: single-thread event loop and Libuv thread pool", "Build structured RESTful backends using Express.js routing and middleware", "Implement secure authentication with JSON Web Tokens (JWT) and Bcrypt hashing", "Design production-grade centralized error-handling middleware"],
        "thumb": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Node.js Architecture & Core Modules", "The V8 and Libuv execution environment on the server.", [
                ("Node.js Runtime, Libuv & The Event Loop", "Libuv thread pool (UV_THREADPOOL_SIZE), timers, I/O polling, and setImmediate.", "TEXT", "javascript"),
                ("CommonJS vs ES Modules (import/export)", "require vs import, module caching, and package.json 'type': 'module'.", "CODE", "javascript"),
                ("Core Modules: fs, path, os & Events", "Async fs.promises, path.join, EventEmitter publish-subscribe pattern.", "CODE", "javascript"),
            ]),
            ("Express Framework & Middleware Pipeline", "Request lifecycle, routing, and middleware sequencing.", [
                ("Express Application Architecture & Routing", "app.use, router instances, route parameters (:id), and query strings.", "CODE", "javascript"),
                ("The Middleware Chain & next() Function", "Request/Response lifecycle, third-party middleware (cors, morgan, helmet).", "CODE", "javascript"),
                ("Body Parsing & Request Input Validation", "express.json(), express.urlencoded(), and schema validation with Zod/Joi.", "CODE", "javascript"),
            ]),
            ("Authentication, Authorization & Security", "Securing backend endpoints against unauthorized access.", [
                ("Password Hashing with Bcrypt & Salt Rounds", "Cryptographic salts, rainbow table resistance, and compare algorithms.", "CODE", "javascript"),
                ("JSON Web Tokens (JWT) Authentication", "Signing JWTs, verifying signatures, payload claims, and Bearer tokens.", "CODE", "javascript"),
                ("Role-Based Access Control (RBAC) Middleware", "Protecting routes by user roles (student vs admin) and token validation.", "CODE", "javascript"),
            ]),
            ("Error Handling, Database Drivers & Production", "Hardening server APIs for real-world reliability.", [
                ("Centralized Error Handling Middleware", "Catching async errors, custom AppError classes, and HTTP status codes.", "CODE", "javascript"),
                ("Connecting Relational & NoSQL Databases", "Connection pooling, ORMs/ODMs (Prisma, Mongoose), and query timeouts.", "CODE", "javascript"),
                ("Rate Limiting, CORS & Production Deployment", "express-rate-limit, CORS headers, environment variables with dotenv.", "CODE", "javascript"),
            ]),
        ]
    },
    {
        "num": 18, "cat_key": "categoryB", "cat_name": "Web Development",
        "title": "Full-Stack Web Development", "code": "WEB108", "branch": "CSE", "sem": 6, "diff": "Advanced", "mins": 720,
        "short_desc": "End-to-end full-stack web applications: React frontend, Express API, PostgreSQL database, and CI/CD.",
        "desc": "Integrate every layer of modern web engineering into a cohesive full-stack software application. Connect React and TypeScript frontends to Node.js backend services, execute relational database migrations, manage global state, and handle secure uploads.",
        "skills": ["Full-Stack Architecture", "React + Node.js", "PostgreSQL / Prisma", "State Synchronization", "Docker Integration"],
        "prereqs": ["React.js Development", "Node.js and Express"],
        "objectives": ["Architect end-to-end full-stack software systems with type-safe APIs", "Connect client applications to database backends using ORMs and connection pools", "Manage client-server state synchronization, optimistic UI updates, and error rollbacks", "Containerize full-stack services using Docker Compose"],
        "thumb": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Full-Stack Architecture & Project Scaffolding", "Monorepo structures, shared TypeScript contracts, and build tooling.", [
                ("Full-Stack Monorepo Structure & Tooling", "Monorepos with npm workspaces, sharing TypeScript types across client and server.", "TEXT", "typescript"),
                ("Client-Server Contract Design with OpenAPI / tRPC", "Type-safe API contracts, auto-generating client SDKs, and payload validation.", "CODE", "typescript"),
                ("Environment Configurations & Secrets Management", "Client public envs vs server secrets, security hygiene, and .env.example.", "CODE", "bash"),
            ]),
            ("Data Layer Integration & Migrations", "Persistent relational database engineering.", [
                ("PostgreSQL Database Schema & Relational Modeling", "Foreign keys, indexes, cascade deletes, and schema normalization.", "CODE", "sql"),
                ("ORM Integration with Prisma", "Prisma schema, migrations, auto-generated type-safe queries, and transactions.", "CODE", "typescript"),
                ("Database Seeding & Automated Fixtures", "Repeatable idempotent seeding scripts for development and test harnesses.", "CODE", "typescript"),
            ]),
            ("Authentication Flow & State Synchronization", "End-to-end user session lifecycle.", [
                ("Full-Stack Authentication: Cookies vs LocalStorage", "HttpOnly secure cookies, refresh token rotation, and XSS/CSRF mitigations.", "CODE", "typescript"),
                ("Auth State Provider & Protected Frontend Routes", "React AuthContext, private route wrappers, and session restoration.", "CODE", "tsx"),
                ("Optimistic UI Updates & Cache Invalidation", "Updating client UI before server confirmation and rolling back on network failure.", "CODE", "tsx"),
            ]),
            ("File Uploads, WebSockets & Containerization", "Rich multimedia and real-time bidirectional capabilities.", [
                ("Multipart File Uploads to Cloud Storage (S3)", "Multer, presigned upload URLs, file validation, and CDN distribution.", "CODE", "typescript"),
                ("Real-Time Communication with WebSockets (Socket.io)", "WebSocket handshakes, rooms, event broadcasts, and heartbeat pings.", "CODE", "typescript"),
                ("Containerizing Full-Stack Apps with Docker Compose", "Multi-stage Dockerfiles for Vite and Node, Docker Compose for Postgres.", "CODE", "dockerfile"),
            ]),
        ]
    },
    {
        "num": 19, "cat_key": "categoryB", "cat_name": "Web Development",
        "title": "REST API Development", "code": "WEB109", "branch": "IT", "sem": 5, "diff": "Intermediate", "mins": 540,
        "short_desc": "RESTful API design principles, HTTP methods, status codes, OpenAPI/Swagger specifications, and versioning.",
        "desc": "Design professional, scalable, and standardized RESTful APIs. Master the Richardson Maturity Model, HTTP idempotency, caching with ETag headers, cursor-based pagination, URI resource modeling, versioning strategies, and Swagger documentation.",
        "skills": ["RESTful Design", "HTTP Protocols", "OpenAPI / Swagger", "API Versioning", "Pagination & Filtering", "ETags & Caching"],
        "prereqs": ["Node.js and Express"],
        "objectives": ["Design clean, intuitive, and resource-oriented RESTful URI hierarchies", "Apply proper HTTP verbs (GET, POST, PUT, PATCH, DELETE) and status codes", "Implement efficient cursor-based and offset-based pagination mechanisms", "Document APIs comprehensively using OpenAPI 3.0 and Swagger UI"],
        "thumb": "https://images.unsplash.com/photo-1516116211227-bbc0c25a07c3?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("REST Architecture & HTTP Foundations", "Core principles of representational state transfer.", [
                ("Richardson Maturity Model & REST Constraints", "Statelessness, client-server, cacheable, uniform interface, and HATEOAS.", "TEXT", "text"),
                ("HTTP Methods Semantics & Idempotency", "Safe vs unsafe methods, idempotent PUT/DELETE vs non-idempotent POST.", "CODE", "http"),
                ("HTTP Status Codes & Standardized Errors", "2xx success, 3xx redirects, 4xx client errors, 5xx server errors, RFC 7807.", "CODE", "json"),
            ]),
            ("Resource Modeling & URI Design", "Designing clean, logical API endpoints.", [
                ("Noun-Based Resource URIs & Hierarchies", "Plural resource names (/courses/:id/lessons), nested vs flat endpoints.", "CODE", "text"),
                ("Query Parameters: Filtering, Searching & Sorting", "Field selection (?fields=title,code), fuzzy search, and multi-field sorting.", "CODE", "typescript"),
                ("Pagination: Offset vs Keyset (Cursor-Based)", "LIMIT/OFFSET performance bottlenecks vs O(1) indexed cursor pagination.", "CODE", "typescript"),
            ]),
            ("API Performance, Caching & Rate Limiting", "Ensuring API resilience under high traffic loads.", [
                ("HTTP Caching: Cache-Control, ETag & Last-Modified", "Conditional GET requests (304 Not Modified), cache validation, and max-age.", "CODE", "typescript"),
                ("Rate Limiting Algorithms: Token Bucket & Leaky Bucket", "Sliding window rate limiters, 429 Too Many Requests, and retry headers.", "CODE", "typescript"),
                ("API Versioning Strategies", "URI path versioning (/v1), query string versioning, and header content negotiation.", "CODE", "typescript"),
            ]),
            ("OpenAPI Specification & Testing", "Standardized documentation and API testing.", [
                ("OpenAPI 3.0 & Swagger UI Integration", "Writing YAML/JSON OpenAPI specs, defining schemas, and generating interactive docs.", "CODE", "yaml"),
                ("Automated Contract Testing with Supertest", "Integration testing HTTP endpoints, asserting status codes, headers, and schemas.", "CODE", "typescript"),
                ("API Gateway Patterns & Reverse Proxies", "Routing requests, terminating SSL, load balancing, and cross-cutting concerns.", "TEXT", "text"),
            ]),
        ]
    },
    {
        "num": 20, "cat_key": "categoryB", "cat_name": "Web Development",
        "title": "Web Application Security", "code": "WEB110", "branch": "CSE", "sem": 6, "diff": "Advanced", "mins": 620,
        "short_desc": "OWASP Top 10 vulnerabilities: XSS, CSRF, SQL Injection, SSRF, CORS, CSP headers, and secure coding.",
        "desc": "Defend modern web applications against cyber attacks. Analyze the OWASP Top 10 vulnerabilities, execute defensive coding against Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), SQL Injection, Server-Side Request Forgery (SSRF), and CSP headers.",
        "skills": ["OWASP Top 10", "XSS Prevention", "CSRF Protection", "SQL Injection Defense", "Content Security Policy (CSP)", "CORS Headers"],
        "prereqs": ["Node.js and Express", "Web Development Fundamentals"],
        "objectives": ["Identify and neutralize OWASP Top 10 web security vulnerabilities", "Prevent Cross-Site Scripting (XSS) via context-aware output encoding and CSP", "Mitigate Cross-Site Request Forgery (CSRF) using SameSite cookies and anti-CSRF tokens", "Harden HTTP response headers using Helmet.js and strict CORS policies"],
        "thumb": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("OWASP Top 10 & Injection Attacks", "Common web attack vectors and database security.", [
                ("The OWASP Top 10 Threat Landscape", "Overview of injection, broken authentication, cryptographic failures, and misconfigs.", "TEXT", "text"),
                ("SQL & NoSQL Injection Mechanics", "Tainted user input, SQL query concatenation, and parameterized prepared statements.", "CODE", "sql"),
                ("Command Injection & File Upload Vulnerabilities", "shell execution risks, sanitizing file paths, MIME verification, and path traversal.", "CODE", "javascript"),
            ]),
            ("Client-Side Vulnerabilities: XSS & CSRF", "Protecting the browser from malicious script execution.", [
                ("Cross-Site Scripting (XSS): Stored, Reflected, DOM", "Script injection vectors, context-aware HTML escaping, and sanitize-html.", "CODE", "html"),
                ("Content Security Policy (CSP) Directives", "default-src, script-src nonces/hashes, object-src 'none', and CSP violation reporting.", "CODE", "http"),
                ("Cross-Site Request Forgery (CSRF) Defenses", "SameSite cookie attributes (Strict/Lax), double submit cookie pattern, CSRF tokens.", "CODE", "javascript"),
            ]),
            ("Authentication, Sessions & Access Control", "Safeguarding user identities and authorization boundaries.", [
                ("Broken Authentication & Session Hijacking", "Session fixation, brute force lockout, timing attacks, and constant-time compares.", "CODE", "javascript"),
                ("Insecure Direct Object References (IDOR)", "Enforcing tenant/user authorization ownership checks on all resource queries.", "CODE", "typescript"),
                ("Security Headers: Helmet, HSTS & Clickjacking", "Strict-Transport-Security, X-Frame-Options (DENY), and X-Content-Type-Options.", "CODE", "javascript"),
            ]),
            ("Advanced Web Exploits & Defense In Depth", "Modern perimeter threats and defensive automation.", [
                ("Server-Side Request Forgery (SSRF) Mitigations", "Private IP filtering, DNS rebinding attacks, and restricting outbound webhooks.", "CODE", "typescript"),
                ("CORS Security: Access-Control-Allow-Origin Pitfalls", "Null origin risks, avoiding wildcard with credentials, and preflight OPTIONS checks.", "CODE", "javascript"),
                ("Automated Security Auditing & Dependency Scanning", "npm audit, Snyk vulnerability scanning, and secret leak detection in Git.", "TEXT", "bash"),
            ]),
        ]
    },
]

COURSES_C = [
    {
        "num": 21, "cat_key": "categoryC", "cat_name": "Computer Science Core",
        "title": "Database Management Systems", "code": "CSC201", "branch": "CSE", "sem": 4, "diff": "Intermediate", "mins": 620,
        "short_desc": "Relational algebra, ER modeling, normal forms (1NF to BCNF), transaction ACID properties, and concurrency.",
        "desc": "Foundations of relational database systems. Master entity-relationship (ER) modeling, relational algebra operators, schema normalization (1NF, 2NF, 3NF, BCNF), ACID guarantees, write-ahead logging (WAL), two-phase locking (2PL), and crash recovery.",
        "skills": ["Relational Algebra", "ER Modeling", "Normalization (BCNF)", "ACID Transactions", "Concurrency Control", "WAL Logging"],
        "prereqs": ["Data Structures Fundamentals"],
        "objectives": ["Translate business requirements into optimized Entity-Relationship (ER) schemas", "Decompose database relations to eliminate anomalies using 3NF and BCNF", "Understand serializability, isolation levels, and two-phase locking protocols", "Explain database crash recovery algorithms using ARIES and write-ahead logs"],
        "thumb": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Database Architecture & ER Modeling", "Relational data abstractions and conceptual modeling.", [
                ("DBMS Architecture & Three-Schema Architecture", "Physical, logical, and external schemas, data independence.", "TEXT", "text"),
                ("Entity-Relationship (ER) Diagrams", "Entities, weak entities, cardinalities (1:1, 1:N, M:N), and specialization.", "TEXT", "text"),
                ("Relational Model & Relational Algebra", "Select, project, cross product, natural join, set union, and division operators.", "CODE", "sql"),
            ]),
            ("Schema Design & Normalization", "Eliminating redundancy and modification anomalies.", [
                ("Functional Dependencies & Closure Sets", "Armstrong's axioms, attribute closure (X+), and minimal canonical covers.", "TEXT", "text"),
                ("Normal Forms: 1NF, 2NF & 3NF", "First, second, and third normal forms, transitive dependencies.", "CODE", "sql"),
                ("Boyce-Codd Normal Form (BCNF) & Decomposition", "Lossless-join decomposition, dependency preservation, and 4NF multi-valued dependencies.", "CODE", "sql"),
            ]),
            ("Transactions & Concurrency Control", "Maintaining data consistency under concurrent access.", [
                ("ACID Properties & Transaction States", "Atomicity, Consistency, Isolation, Durability, and state transitions.", "TEXT", "text"),
                ("Conflict & View Serializability", "Precedence graphs, cycle detection, and conflict equivalence.", "TEXT", "text"),
                ("Two-Phase Locking (2PL) & Deadlocks", "Strict 2PL, shared/exclusive locks, deadlock prevention, and wait-die/wound-wait schemes.", "CODE", "sql"),
            ]),
            ("Crash Recovery & Storage Architecture", "Fault-tolerant persistent storage and disk access.", [
                ("Disks, Pages, Buffers & Slotted Pages", "Page formats, record IDs (RID), buffer pool LRU management, and dirty pages.", "TEXT", "text"),
                ("Write-Ahead Logging (WAL) & ARIES Protocol", "WAL protocol invariants, Analysis, Redo, and Undo passes during restart.", "TEXT", "text"),
                ("Shadow Paging & Checkpoint Mechanisms", "Consistent checkpoints, fuzzy checkpoints, and snapshot isolation.", "TEXT", "text"),
            ]),
        ]
    },
    {
        "num": 22, "cat_key": "categoryC", "cat_name": "Computer Science Core",
        "title": "SQL Fundamentals", "code": "CSC202", "branch": "IT", "sem": 3, "diff": "Beginner", "mins": 500,
        "short_desc": "Relational queries: DDL, DML, DCL, aggregations, INNER/OUTER joins, subqueries, and views.",
        "desc": "Hands-on mastery of Structured Query Language (SQL). Write declarative data definition statements (CREATE, ALTER, DROP), data manipulation queries (SELECT, INSERT, UPDATE, DELETE), multi-table JOIN operations, GROUP BY aggregations, and subqueries.",
        "skills": ["SQL DDL/DML", "Inner/Outer Joins", "Aggregations & Group By", "Subqueries", "Views & Constraints"],
        "prereqs": ["None - Open to all engineering students"],
        "objectives": ["Create relational database schemas with primary, foreign, and unique key constraints", "Retrieve data across multiple tables using INNER, LEFT, RIGHT, and FULL OUTER JOINs", "Perform statistical grouping using GROUP BY and filtering with HAVING clauses", "Construct nested subqueries, correlated subqueries, and common table expressions"],
        "thumb": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("SQL Data Definition & Table Constraints", "Defining relational structures and enforcing integrity.", [
                ("DDL: CREATE, ALTER, DROP & TRUNCATE", "Table definitions, data types, auto-increment keys, and default values.", "CODE", "sql"),
                ("Integrity Constraints: PRIMARY, FOREIGN, CHECK & UNIQUE", "Referential integrity, ON DELETE CASCADE, NOT NULL, and custom CHECK rules.", "CODE", "sql"),
                ("Basic DML: INSERT, UPDATE, DELETE", "Inserting rows, bulk inserts, conditional updates, and transactional deletes.", "CODE", "sql"),
            ]),
            ("Data Retrieval & Filtering", "Extracting targeted datasets from database tables.", [
                ("SELECT Syntax, Aliases & DISTINCT", "Column projection, column aliases (AS), and deduplicating result sets.", "CODE", "sql"),
                ("WHERE Filtering & Logical Operators", "Comparison operators, AND, OR, NOT, BETWEEN, IN, and LIKE pattern matching.", "CODE", "sql"),
                ("Sorting & Limiting Results: ORDER BY & LIMIT", "Ascending/descending sort, multi-column sorting, and pagination with OFFSET.", "CODE", "sql"),
            ]),
            ("Multi-Table Joins & Set Operations", "Connecting relational entities across schemas.", [
                ("INNER JOIN & Equi-Joins", "Matching records, join predicates (ON), and aliasing joined tables.", "CODE", "sql"),
                ("LEFT, RIGHT & FULL OUTER JOINs", "Preserving unmatched rows, NULL handling in joins, and cross joins.", "CODE", "sql"),
                ("Set Operations: UNION, INTERSECT & EXCEPT", "Combining query results, UNION vs UNION ALL, and schema compatibility.", "CODE", "sql"),
            ]),
            ("Aggregations, Subqueries & Views", "Summarizing datasets and constructing virtual relations.", [
                ("Aggregate Functions: COUNT, SUM, AVG, MIN, MAX", "Calculating summary statistics over row partitions.", "CODE", "sql"),
                ("GROUP BY & HAVING Clauses", "Grouping records, aggregating per group, and filtering groups with HAVING.", "CODE", "sql"),
                ("Subqueries & Relational Views", "Scalar subqueries, correlated subqueries (EXISTS), and CREATE VIEW.", "CODE", "sql"),
            ]),
        ]
    },
    {
        "num": 23, "cat_key": "categoryC", "cat_name": "Computer Science Core",
        "title": "Advanced SQL and Query Optimization", "code": "CSC203", "branch": "IT", "sem": 5, "diff": "Advanced", "mins": 620,
        "short_desc": "Window functions, Common Table Expressions (CTEs), EXPLAIN ANALYZE, B+ Tree indexing, and query tuning.",
        "desc": "Elevate SQL proficiency to database engineer level. Master analytical window functions (RANK, DENSE_RANK, ROW_NUMBER, LEAD/LAG), recursive CTEs, B+ Tree disk indexing, query execution plans (EXPLAIN ANALYZE), join algorithms, and partitioning.",
        "skills": ["Window Functions", "Recursive CTEs", "B+ Tree Indexing", "EXPLAIN ANALYZE", "Query Optimization", "Table Partitioning"],
        "prereqs": ["SQL Fundamentals"],
        "objectives": ["Write complex analytical queries using window functions and framing specifications", "Traverse hierarchical graphs using recursive Common Table Expressions", "Analyze query execution plans to identify sequential table scans and bottleneck operations", "Optimize query performance using composite indexes, covering indexes, and table partitions"],
        "thumb": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Window Functions & Analytical SQL", "Advanced data analytics without row collapsing.", [
                ("Ranking Functions: ROW_NUMBER, RANK, DENSE_RANK", "PARTITION BY, ORDER BY clauses, and resolving ties in datasets.", "CODE", "sql"),
                ("Value Window Functions: LEAD, LAG, FIRST_VALUE", "Comparing row values against previous or subsequent time intervals.", "CODE", "sql"),
                ("Window Frames: ROWS / RANGE BETWEEN", "Moving averages, cumulative sums, UNBOUNDED PRECEDING, and CURRENT ROW.", "CODE", "sql"),
            ]),
            ("Common Table Expressions (CTEs) & Recursion", "Modular SQL query pipelines and graph traversal.", [
                ("Standard CTEs with WITH Clause", "Decomposing complex queries into readable, reusable temporary result sets.", "CODE", "sql"),
                ("Recursive CTEs for Hierarchical Data", "Anchor members, recursive members, organizational trees, and graph search.", "CODE", "sql"),
                ("Pivoting & Dynamic Crosstabs", "Transforming rows into columns using CASE WHEN and filter aggregation.", "CODE", "sql"),
            ]),
            ("B+ Tree Indexing & Internal Data Structures", "How relational engines find records in logarithmic time.", [
                ("B+ Tree Indexes vs Hash Indexes", "B+ Tree fanout, node splits, leaf linked lists, range scans vs exact lookups.", "TEXT", "sql"),
                ("Composite Indexes & The Leftmost Prefix Rule", "Index column ordering, selectivity, and avoiding index misses.", "CODE", "sql"),
                ("Covering Indexes & Index-Only Scans", "Eliminating heap lookups using INCLUDE clauses and index leaf storage.", "CODE", "sql"),
            ]),
            ("Query Execution Plans & Optimization", "Profiling and accelerating database engines.", [
                ("Understanding EXPLAIN & EXPLAIN ANALYZE", "Estimated cost vs actual runtime, sequential scans vs index scans.", "CODE", "sql"),
                ("Join Algorithms: Nested Loop, Hash Join & Merge Join", "Memory cost, sort overhead, and optimizer algorithm selection heuristics.", "TEXT", "sql"),
                ("Horizontal Table Partitioning", "Range and list partitioning, partition pruning, and managing multi-terabyte tables.", "CODE", "sql"),
            ]),
        ]
    },
    {
        "num": 24, "cat_key": "categoryC", "cat_name": "Computer Science Core",
        "title": "Operating Systems", "code": "CSC204", "branch": "CSE", "sem": 4, "diff": "Intermediate", "mins": 660,
        "short_desc": "Processes, threads, CPU scheduling, synchronization (mutex/semaphores), virtual memory, and file systems.",
        "desc": "Comprehensive exploration of modern computer operating systems. Learn process address space layout, context switching, CPU scheduling algorithms, inter-process communication (IPC), concurrency synchronization, virtual memory paging, and Unix file systems.",
        "skills": ["Process Management", "CPU Scheduling", "Mutex & Semaphores", "Virtual Memory & Paging", "Page Replacement", "Unix File Systems"],
        "prereqs": ["Computer Organization and Architecture", "Programming with C"],
        "objectives": ["Understand process state transitions, PCB structures, and fork/exec system calls", "Analyze CPU scheduling algorithms: Round Robin, Multi-Level Feedback Queue", "Solve concurrency race conditions using mutex locks, semaphores, and condition variables", "Calculate virtual-to-physical address translations with Multi-Level Page Tables and TLB"],
        "thumb": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Processes, Threads & System Calls", "Execution abstractions and kernel privilege levels.", [
                ("User Mode vs Kernel Mode & Dual-Mode Execution", "Traps, interrupts, syscall dispatch table, and privilege boundaries.", "TEXT", "c"),
                ("Process Control Block (PCB) & Context Switching", "Process memory segments (text, data, heap, stack) and register swapping.", "CODE", "c"),
                ("Process Creation: fork(), exec(), wait() & POSIX Threads", "Process tree hierarchy, zombie/orphan processes, and pthread APIs.", "CODE", "c"),
            ]),
            ("CPU Scheduling & Real-Time Policies", "Allocating core cycles to competing workloads.", [
                ("Scheduling Criteria & Basic Algorithms", "FCFS, Shortest Job First (SJF), Shortest Remaining Time First (SRTF).", "TEXT", "text"),
                ("Round Robin & Priority Scheduling", "Time quantum sizing, context switch overhead, and priority inversion.", "CODE", "c"),
                ("Multi-Level Feedback Queue (MLFQ)", "Dynamic priority adjustment, starvation prevention, and aging heuristics.", "TEXT", "text"),
            ]),
            ("Process Synchronization & Deadlocks", "Eliminating race conditions and circular resource waits.", [
                ("Critical Section Problem & Peterson's Algorithm", "Mutual exclusion, progress, and bounded waiting requirements.", "CODE", "c"),
                ("Semaphores, Mutexes & Condition Variables", "Counting semaphores, binary semaphores, Producer-Consumer problem.", "CODE", "c"),
                ("Deadlock Characterization & Banker's Algorithm", "Coffman conditions, resource allocation graphs, and safe state checking.", "CODE", "c"),
            ]),
            ("Virtual Memory & File Systems", "Memory virtualization and persistent storage management.", [
                ("Paging & Hardware Address Translation (TLB)", "Virtual address split (VPN/VPO), page tables, and TLB hit/miss latency.", "TEXT", "text"),
                ("Page Replacement Algorithms", "FIFO, Optimal (Belady's anomaly), Least Recently Used (LRU), Clock algorithm.", "CODE", "c"),
                ("Unix File System (UFS) & Inode Structure", "Direct, single/double indirect pointer blocks, directory hard/soft links.", "TEXT", "text"),
            ]),
        ]
    },
    {
        "num": 25, "cat_key": "categoryC", "cat_name": "Computer Science Core",
        "title": "Computer Networks", "code": "CSC205", "branch": "CSE", "sem": 5, "diff": "Intermediate", "mins": 640,
        "short_desc": "OSI & TCP/IP stack, IP routing, subnetting, TCP flow/congestion control, DNS, and socket programming.",
        "desc": "The architectural principles of internetworking. Master the 5-layer Internet model, physical transmission media, data link framing and CSMA/CD, IPv4/IPv6 CIDR subnetting, distance-vector and link-state routing, TCP reliable delivery, and application protocols.",
        "skills": ["TCP/IP Protocol Stack", "CIDR Subnetting", "Routing Protocols (OSPF, BGP)", "TCP Flow & Congestion Control", "Socket Programming"],
        "prereqs": ["Operating Systems"],
        "objectives": ["Map network communication flows across the 5 layers of the TCP/IP stack", "Perform IPv4 Variable Length Subnet Masking (VLSM) and CIDR address allocations", "Trace packet forwarding using Dijkstra link-state (OSPF) and BGP path vectors", "Differentiate TCP reliable delivery (sliding window, AIMD) from UDP datagrams"],
        "thumb": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Network Architecture & Physical/Data Link Layers", "Packet switching, topologies, framing, and error detection.", [
                ("OSI 7-Layer Model vs TCP/IP 5-Layer Stack", "Encapsulation, decapsulation, protocol data units (PDU), packet switching.", "TEXT", "text"),
                ("Data Link Framing, Bit Stuffing & CRC Error Checks", "Cyclic Redundancy Check polynomial math, parity, and framing sentinels.", "CODE", "c"),
                ("Medium Access Control: CSMA/CD & Ethernet MAC", "Carrier sensing, collision detection, exponential backoff, and MAC addresses.", "TEXT", "text"),
            ]),
            ("Network Layer: IP Addressing & Subnetting", "Host-to-host packet delivery across heterogeneous networks.", [
                ("IPv4 Addressing, Classes & CIDR Notation", "Subnet masks, network ID, broadcast address, and CIDR prefix slash notation.", "TEXT", "text"),
                ("Variable Length Subnet Masking (VLSM) Calculations", "Subnet sizing algorithms, host calculations, and route aggregation.", "CODE", "python"),
                ("IPv6 Architecture & Neighbor Discovery Protocol", "128-bit addresses, hex formatting, SLAAC auto-configuration, and dual-stack.", "TEXT", "text"),
            ]),
            ("Routing Protocols & Network Algorithms", "Determining optimal packet forwarding paths across autonomous systems.", [
                ("Link-State Routing & OSPF (Dijkstra's Algorithm)", "Link-state advertisements (LSA), shortest path first tree calculation.", "CODE", "python"),
                ("Distance-Vector Routing & Count-to-Infinity", "Bellman-Ford algorithm, split horizon, and poison reverse techniques.", "CODE", "python"),
                ("Border Gateway Protocol (BGP) & Autonomous Systems", "Path vector routing, AS relationships, peering, and global transit.", "TEXT", "text"),
            ]),
            ("Transport & Application Layer Protocols", "Process-to-process communication, reliability, and web protocols.", [
                ("TCP Three-Way Handshake & Four-Way Teardown", "SYN, ACK, FIN packet flags, sequence numbers, and TIME_WAIT state.", "TEXT", "text"),
                ("TCP Flow Control & Congestion Control (AIMD)", "Sliding window, Reno, Cubic, Slow Start, Congestion Avoidance, Fast Retransmit.", "CODE", "c"),
                ("DNS, HTTP/1.1 vs HTTP/2 vs HTTP/3 & Sockets", "Recursive DNS resolution, multiplexed binary frames, QUIC UDP, socket APIs.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 26, "cat_key": "categoryC", "cat_name": "Computer Science Core",
        "title": "Computer Organization and Architecture", "code": "CSC206", "branch": "CSE", "sem": 3, "diff": "Intermediate", "mins": 600,
        "short_desc": "Instruction Set Architecture (RISC-V/MIPS), CPU pipelining, hazards, cache hierarchies, and memory mapping.",
        "desc": "How software instructions execute on silicon hardware. Study the Von Neumann architecture, instruction set design (RISC vs CISC), ALU design, 5-stage CPU instruction pipelining, hazard resolution (structural, data, control), and multi-level CPU caching.",
        "skills": ["RISC-V Architecture", "5-Stage Pipelining", "Pipeline Hazards & Forwarding", "Cache Mapping (Direct/Set-Associative)", "Memory Hierarchies"],
        "prereqs": ["Digital Electronics", "Programming Fundamentals with C"],
        "objectives": ["Translate assembly instructions into machine code for RISC-V architectures", "Design data path and control units for single-cycle and pipelined processors", "Resolve data and control hazards using forwarding and branch prediction", "Calculate cache hit/miss rates across direct-mapped and set-associative caches"],
        "thumb": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Instruction Set Architecture & Machine Code", "The hardware-software interface and instruction formats.", [
                ("Von Neumann Architecture & Register Transfer Language", "Stored-program concept, memory-bus architecture, PC, IR, and ALU.", "TEXT", "text"),
                ("RISC vs CISC Philosophies & Register Conventions", "Load/store architecture vs complex memory instructions, calling conventions.", "TEXT", "text"),
                ("Instruction Encoding: R, I, S, B, U, J Types", "Opcode, funct3, funct7, register fields, and sign-extended immediates.", "CODE", "c"),
            ]),
            ("Processor Datapath & Single-Cycle Design", "Connecting execution units with control signals.", [
                ("Single-Cycle Datapath Construction", "Instruction memory, register file, ALU, data memory, and write-back path.", "TEXT", "text"),
                ("ALU Design & Integer Arithmetic Hardware", "Carry-lookahead adders, Wallace tree multipliers, and overflow detection.", "CODE", "verilog"),
                ("Control Unit Logic & Signal Generation", "Decoding opcodes into RegWrite, MemRead, MemWrite, ALUSrc, and Branch.", "TEXT", "text"),
            ]),
            ("Pipelining & Hazard Resolution", "Maximizing instruction throughput via concurrent stage execution.", [
                ("The 5-Stage Pipeline: IF, ID, EX, MEM, WB", "Pipeline registers, cycle time bounds, and throughput speedup limits.", "TEXT", "text"),
                ("Structural & Data Hazards: Forwarding & Stalling", "Read-after-write (RAW) dependencies, forwarding unit logic, and load-use stalls.", "CODE", "text"),
                ("Control Hazards & Dynamic Branch Prediction", "Branch penalties, 2-bit saturating counters, and branch target buffers (BTB).", "TEXT", "text"),
            ]),
            ("Memory Hierarchy & Cache Design", "Bridging the CPU-memory latency gap.", [
                ("Locality of Reference: Temporal & Spatial", "Memory access patterns and cache hierarchy (L1, L2, L3, Main Memory).", "TEXT", "text"),
                ("Cache Mapping: Direct-Mapped, Fully & Set-Associative", "Tag, Index, and Offset bit breakdown, cache hit/miss calculations.", "CODE", "c"),
                ("Cache Write Policies & Replacement Strategies", "Write-through vs write-back with dirty bit, LRU and FIFO replacement.", "TEXT", "text"),
            ]),
        ]
    },
    {
        "num": 27, "cat_key": "categoryC", "cat_name": "Computer Science Core",
        "title": "Theory of Computation", "code": "CSC207", "branch": "CSE", "sem": 5, "diff": "Advanced", "mins": 620,
        "short_desc": "Finite Automata (DFA/NFA), Regular Expressions, Pushdown Automata, Context-Free Grammars, and Turing Machines.",
        "desc": "The mathematical limits of computer computation. Master Deterministic/Non-deterministic Finite Automata (DFA/NFA), regular grammar equivalence, pumping lemma for regular and context-free languages, pushdown automata, Turing machines, and undecidability.",
        "skills": ["DFA & NFA Construction", "Regular Expressions", "Pumping Lemma", "Context-Free Grammars", "Turing Machines", "Undecidability"],
        "prereqs": ["Discrete Mathematics"],
        "objectives": ["Construct minimal Deterministic Finite Automata (DFA) using state equivalence", "Convert Non-Deterministic Finite Automata (NFA) to DFA via subset construction", "Prove non-regularity and non-context-freeness using the Pumping Lemma", "Formulate standard Turing Machines and understand the Halting Problem proof"],
        "thumb": "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Regular Languages & Finite Automata", "State-machine computation without external memory.", [
                ("Deterministic Finite Automata (DFA) Formalism", "5-tuple definition (Q, Sigma, delta, q0, F), transition tables, state graphs.", "TEXT", "text"),
                ("Nondeterministic Finite Automata (NFA) & Epsilon Transitions", "State branching, epsilon closures, and subset construction algorithm.", "CODE", "python"),
                ("DFA State Minimization & Myhill-Nerode Theorem", "Table filling algorithm, distinguishable states, and minimal DFA proofs.", "TEXT", "text"),
            ]),
            ("Regular Expressions & Language Limits", "Syntactic patterns and proving non-regularity.", [
                ("Regular Expressions & Arden's Theorem", "Converting DFA state equations to regex and Thompson's construction.", "TEXT", "text"),
                ("Pumping Lemma for Regular Languages", "Adversarial proof technique for showing languages like a^n b^n are non-regular.", "TEXT", "text"),
                ("Closure Properties of Regular Languages", "Union, intersection, complement, star, reversal, and homomorphism proofs.", "TEXT", "text"),
            ]),
            ("Context-Free Languages & Pushdown Automata", "Stack-based automata and linguistic syntax grammars.", [
                ("Context-Free Grammars (CFG) & Derivations", "Production rules, leftmost/rightmost derivations, parse trees, and ambiguity.", "TEXT", "text"),
                ("Chomsky Normal Form (CNF) & CYK Algorithm", "Eliminating null and unit productions, CYK O(n^3) parsing algorithm.", "CODE", "python"),
                ("Pushdown Automata (PDA): Acceptance by Final State vs Empty Stack", "7-tuple PDA definition, stack transition relations, and DPDA vs NPDA.", "TEXT", "text"),
            ]),
            ("Turing Machines, Computability & Complexity", "Universal computation and undecidable computational limits.", [
                ("Standard Turing Machine Model & Tape Transitions", "Read-write tape heads, halting states, and instantaneous descriptions.", "CODE", "python"),
                ("Chomsky Hierarchy & Church-Turing Thesis", "Regular, context-free, context-sensitive, and recursively enumerable sets.", "TEXT", "text"),
                ("The Halting Problem & Undecidability Proofs", "Diagonalization argument, Rice's Theorem, and reductions to Halting Problem.", "TEXT", "text"),
            ]),
        ]
    },
    {
        "num": 28, "cat_key": "categoryC", "cat_name": "Computer Science Core",
        "title": "Compiler Design", "code": "CSC208", "branch": "CSE", "sem": 6, "diff": "Advanced", "mins": 640,
        "short_desc": "Lexical analysis (Flex), parsing (LL/LR/Bison), AST construction, semantic type checking, and code generation.",
        "desc": "How high-level programming languages are translated into optimized machine assembly. Implement lexical analyzers, top-down LL(1) and bottom-up LR(1)/LALR parsers, abstract syntax trees (AST), symbol tables, intermediate representation (Three-Address Code), and register allocation.",
        "skills": ["Lexical Analysis (Lex/Flex)", "LL(1) & LR(1) Parsers", "Abstract Syntax Trees (AST)", "Type Checking", "Intermediate Representation (3AC)", "Register Allocation"],
        "prereqs": ["Theory of Computation", "Programming with C++"],
        "objectives": ["Construct lexical analyzers using regular expressions and transition diagrams", "Build predictive LL(1) parsers and bottom-up LR/LALR parsing tables", "Implement abstract syntax tree (AST) traversal for type checking and scoping", "Generate Three-Address Code (TAC) and allocate hardware registers with Graph Coloring"],
        "thumb": "https://images.unsplash.com/photo-1516116211227-bbc0c25a07c3?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Lexical Analysis & Token Generation", "Converting source text characters into tokens.", [
                ("Compiler Phases: Front-End vs Back-End Architecture", "Lexing, parsing, semantic analysis, optimization, and code generation.", "TEXT", "text"),
                ("Lexical Tokenization & Regular Expression Matching", "Keywords, identifiers, literals, and handling whitespace and comments.", "CODE", "c"),
                ("Lex / Flex Generator Tools", "Defining lex patterns, action rules, yytext, yylval, and integration.", "CODE", "c"),
            ]),
            ("Syntax Analysis & Parsing Algorithms", "Constructing parse trees from linear token streams.", [
                ("Context-Free Grammars, First and Follow Sets", "Calculating First(alpha) and Follow(A) sets for non-terminals.", "CODE", "python"),
                ("Top-Down Parsing: Recursive Descent & LL(1)", "Predictive parsing tables, eliminating left recursion and left factoring.", "CODE", "cpp"),
                ("Bottom-Up Parsing: Shift-Reduce, SLR(1), LR(1) & LALR", "Item sets, goto functions, shift-reduce conflicts, and Bison / Yacc tools.", "CODE", "cpp"),
            ]),
            ("Semantic Analysis & Intermediate Representation", "Validating program semantics and generating linear IR.", [
                ("Abstract Syntax Tree (AST) Construction", "AST node visitor patterns, decorating syntax trees with line numbers.", "CODE", "cpp"),
                ("Symbol Tables & Type Checking Rules", "Scoped symbol tables, type unification, variable scoping, and error reporting.", "CODE", "cpp"),
                ("Three-Address Code (TAC) Generation", "Quadruples, triples, indirect triples, and flattening control statements.", "CODE", "cpp"),
            ]),
            ("Code Optimization & Target Code Generation", "Transforming IR into efficient machine instructions.", [
                ("Basic Blocks & Control Flow Graphs (CFG)", "Leader statements, basic block partitioning, and loop detection.", "TEXT", "text"),
                ("Machine-Independent Optimizations", "Dead code elimination, constant propagation, common subexpression elimination.", "CODE", "cpp"),
                ("Register Allocation via Chaitin's Graph Coloring", "Interference graphs, register spills, K-coloring, and target assembly output.", "CODE", "cpp"),
            ]),
        ]
    },
    {
        "num": 29, "cat_key": "categoryC", "cat_name": "Computer Science Core",
        "title": "Software Engineering", "code": "CSC209", "branch": "CSE", "sem": 5, "diff": "Intermediate", "mins": 560,
        "short_desc": "Agile/Scrum lifecycles, requirements engineering, architectural design, software metrics, and versioning.",
        "desc": "Systematic engineering principles for delivering enterprise software products. Compare Agile, Scrum, Kanban, and Waterfall methodologies. Master user story mapping, functional vs non-functional requirements, architectural styles, software reliability metrics, and technical debt management.",
        "skills": ["Agile / Scrum", "Requirements Engineering", "Architectural Styles", "Software Metrics (Cyclomatic)", "Technical Debt", "Clean Code"],
        "prereqs": ["Object-Oriented Programming"],
        "objectives": ["Apply Scrum sprint cadences: backlog refinement, standups, reviews, and retrospectives", "Author testable user stories with Gherkin acceptance criteria (Given-When-Then)", "Evaluate architectural trade-offs: Monolithic vs Microservices vs Event-Driven", "Compute code maintainability metrics including McCabe's Cyclomatic Complexity"],
        "thumb": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Software Process Models & Agile Methodologies", "Lifecycle models for software product delivery.", [
                ("Traditional vs Agile Paradigms: Waterfall, Spiral, Agile", "Predictive vs adaptive planning, risk-driven iterations, and feedback loops.", "TEXT", "text"),
                ("Scrum Framework & Sprint Ceremonies", "Product Owner, Scrum Master, Sprint Planning, Daily Standup, Review, Retro.", "TEXT", "text"),
                ("Kanban Systems & WIP Limits", "Visualizing value stream workflows, cycle time, and limiting work-in-progress.", "TEXT", "text"),
            ]),
            ("Requirements Engineering & Specifications", "Capturing stakeholder intent into actionable engineering contracts.", [
                ("Functional vs Non-Functional Requirements (NFRs)", "Latency, availability, scalability, auditability, and ISO/IEC 25010 standard.", "TEXT", "text"),
                ("User Story Mapping & Acceptance Criteria", "INVEST criteria, epic decomposition, and Given-When-Then (Gherkin) syntax.", "CODE", "gherkin"),
                ("Software Requirements Specification (SRS) Documents", "IEEE 830 standard structure, traceability matrices, and domain modeling.", "TEXT", "text"),
            ]),
            ("Software Architecture & Design Principles", "High-level component structures and boundary lines.", [
                ("Architectural Patterns: Monoliths vs Layered vs Microservices", "Loose coupling, service boundaries, database-per-service, and network latency.", "TEXT", "text"),
                ("Event-Driven Architecture & CQRS", "Event brokers, pub/sub, command query responsibility segregation, and eventual consistency.", "TEXT", "text"),
                ("Clean Architecture & Hexagonal Ports-and-Adapters", "Domain entities, use-case interactors, and decoupling external frameworks.", "CODE", "typescript"),
            ]),
            ("Quality Assurance, Metrics & Maintenance", "Ensuring long-term sustainability and reliability.", [
                ("McCabe Cyclomatic Complexity & Halstead Metrics", "Control flow graphs, decision points, and calculating test paths V(G).", "CODE", "python"),
                ("Technical Debt Management & Refactoring Strategies", "Code smells, Martin Fowler's refactoring patterns, and straggler migrations.", "TEXT", "text"),
                ("Software Estimation: Story Points & Planning Poker", "Fibonacci estimation scale, velocity tracking, and burn-down charts.", "TEXT", "text"),
            ]),
        ]
    },
    {
        "num": 30, "cat_key": "categoryC", "cat_name": "Computer Science Core",
        "title": "Software Testing and Quality Assurance", "code": "CSC210", "branch": "IT", "sem": 6, "diff": "Intermediate", "mins": 580,
        "short_desc": "Unit testing, integration testing, Test-Driven Development (TDD), mocking, mutation testing, and CI pipelines.",
        "desc": "Build bug-free, resilient software through rigorous automated verification. Learn black-box and white-box testing techniques, boundary value analysis, statement and branch coverage, Test-Driven Development (TDD), mocking frameworks, mutation testing, and end-to-end browser automation.",
        "skills": ["Unit Testing", "Test-Driven Development (TDD)", "Mocking & Stubs", "Code Coverage", "Mutation Testing", "E2E Testing (Playwright)"],
        "prereqs": ["Software Engineering", "Programming in TypeScript or Python"],
        "objectives": ["Apply boundary value analysis and equivalence partitioning for black-box test suites", "Calculate statement, branch, and path code coverage with Istanbul/c8", "Practice Test-Driven Development (Red-Green-Refactor) for production modules", "Author robust end-to-end integration tests using mock servers and Playwright"],
        "thumb": "https://images.unsplash.com/photo-1516116211227-bbc0c25a07c3?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Test Fundamentals & Black-Box Techniques", "Verification strategies without inspecting source code.", [
                ("The Testing Pyramid: Unit, Integration, End-to-End", "Cost of bugs at each phase, test speed, and realistic coverage ratios.", "TEXT", "text"),
                ("Equivalence Partitioning & Boundary Value Analysis", "Partitioning valid/invalid inputs, edge cases (min-1, min, max, max+1).", "CODE", "typescript"),
                ("Decision Table Testing & State Transition Testing", "Modeling complex combinatorial business rules into testing matrices.", "TEXT", "text"),
            ]),
            ("White-Box Testing & Code Coverage", "Analyzing internal branch paths and logic execution.", [
                ("Control Flow Graphs & Basis Path Testing", "Independent execution paths, cyclomatic complexity, and test case matrices.", "TEXT", "text"),
                ("Coverage Metrics: Statement, Branch, Condition & MC/DC", "Branch coverage pitfalls, evaluating ternary conditions, and Istanbul tools.", "CODE", "typescript"),
                ("Mutation Testing & Test Suite Robustness", "Mutating AST operators, mutant kills vs survivors, and Stryker framework.", "TEXT", "typescript"),
            ]),
            ("Test-Driven Development & Mocking", "Guiding design through automated specifications.", [
                ("Test-Driven Development (TDD): Red-Green-Refactor", "Writing failing tests first, minimum viable code, and refactoring safety.", "CODE", "typescript"),
                ("Test Doubles: Dummies, Stubs, Spies & Mocks", "Faking network calls, verifying method call counts, and Vitest/Jest mocks.", "CODE", "typescript"),
                ("Integration Testing & In-Memory Databases", "Testing repository layers with Testcontainers and ephemeral database instances.", "CODE", "typescript"),
            ]),
            ("End-to-End Testing & Automated Quality Gates", "Verifying whole-system user journeys in browser runtimes.", [
                ("Browser Automation with Playwright", "Headless browser tests, locator strategies, network mocking, and visual diffs.", "CODE", "typescript"),
                ("Performance & Load Testing with k6", "Virtual users, response time percentiles (p95, p99), and throughput stress tests.", "CODE", "javascript"),
                ("CI/CD Quality Gates & Automated Release Checks", "Configuring GitHub Actions for linting, test suites, and PR blocking gates.", "CODE", "yaml"),
            ]),
        ]
    },
    {
        "num": 31, "cat_key": "categoryC", "cat_name": "Computer Science Core",
        "title": "Design and Analysis of Algorithms", "code": "CSC211", "branch": "CSE", "sem": 4, "diff": "Advanced", "mins": 720,
        "short_desc": "Asymptotic analysis, advanced graph algorithms, flow networks, string algorithms, and NP-Completeness.",
        "desc": "A rigorous theoretical algorithms curriculum. Master amortized complexity (aggregate and accounting methods), Bellman-Ford, Floyd-Warshall, Ford-Fulkerson network flow, KMP and Rabin-Karp string matching, dynamic programming state compressions, and NP-Completeness reductions.",
        "skills": ["Amortized Complexity", "Shortest Paths (Floyd-Warshall)", "Max Flow / Min Cut", "KMP String Matching", "NP-Completeness", "Polynomial Reductions"],
        "prereqs": ["Algorithms and Problem Solving", "Discrete Mathematics"],
        "objectives": ["Prove amortized bounds using the Potential Method and Accounting Method", "Calculate all-pairs shortest paths and negative cycle detection algorithms", "Model real-world scheduling and matching problems as Maximum Network Flows", "Execute Cook-Levin reduction proofs from 3-SAT to Vertex Cover and Clique"],
        "thumb": "https://images.unsplash.com/photo-1516116211227-bbc0c25a07c3?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Asymptotic Complexity & Amortized Analysis", "Rigorous mathematical bounds for data structure operations.", [
                ("Formal Asymptotic Limits & Master Theorem Extensions", "Big-O, Omega, Theta limits, and Akra-Bazzi method for unequal splits.", "TEXT", "text"),
                ("Amortized Analysis: Aggregate, Accounting & Potential", "Dynamic array resizing, binary counter increment cost, and potential functions.", "CODE", "cpp"),
                ("Disjoint Set Union (DSU) & Inverse Ackermann Bound", "Union by rank, path compression, and O(alpha(n)) amortized operations.", "CODE", "cpp"),
            ]),
            ("Advanced Graph Algorithms", "Network traversal and all-pairs optimization.", [
                ("Single-Source Shortest Paths: Bellman-Ford & DAGs", "Edge relaxation, negative weight cycles, and topological relaxation.", "CODE", "cpp"),
                ("All-Pairs Shortest Paths: Floyd-Warshall & Johnson's", "Dynamic programming 3D matrix transitions and reweighting with Dijkstra.", "CODE", "cpp"),
                ("Network Flow: Ford-Fulkerson & Edmonds-Karp", "Residual graphs, augmenting paths, Max-Flow Min-Cut Theorem, and bipartite matching.", "CODE", "cpp"),
            ]),
            ("String Processing & Advanced DP", "Linear-time string searches and combinatorial optimization.", [
                ("Knuth-Morris-Pratt (KMP) & Longest Prefix Suffix (LPS)", "Preprocessing LPS array, failure functions, and linear O(N + M) search.", "CODE", "cpp"),
                ("Rabin-Karp Rolling Hash & Z-Algorithm", "Polynomial rolling hash, hash collisions, modulo arithmetic, and Z-array.", "CODE", "cpp"),
                ("Bitmask Dynamic Programming & Digit DP", "Traveling Salesperson Problem (TSP) in O(2^n * n^2) and counting valid digits.", "CODE", "cpp"),
            ]),
            ("NP-Completeness & Approximation Algorithms", "The boundary between tractable and intractable computational problems.", [
                ("Complexity Classes: P, NP, NP-Complete & NP-Hard", "Nondeterministic polynomial time, verification algorithms, and Cook-Levin theorem.", "TEXT", "text"),
                ("Polynomial-Time Reductions: 3-SAT to Clique", "Reduction techniques, Vertex Cover, Set Cover, and Hamiltonian Cycle.", "TEXT", "text"),
                ("Approximation Algorithms & Greedy Bounds", "Approximation ratios, 2-approximation for Vertex Cover, Christofides for TSP.", "CODE", "cpp"),
            ]),
        ]
    },
    {
        "num": 32, "cat_key": "categoryC", "cat_name": "Computer Science Core",
        "title": "Distributed Systems Fundamentals", "code": "CSC212", "branch": "CSE", "sem": 7, "diff": "Advanced", "mins": 680,
        "short_desc": "CAP theorem, Lamport clocks, Raft consensus algorithm, vector clocks, two-phase commit, and gRPC.",
        "desc": "Architect reliable software across unreliable networks. Master the CAP theorem, fallacies of distributed computing, logical Lamport clocks, vector clocks, the Raft consensus algorithm (leader election and log replication), two-phase commit (2PC), and RPC communication.",
        "skills": ["CAP Theorem", "Raft Consensus", "Lamport Clocks", "Vector Clocks", "Two-Phase Commit (2PC)", "gRPC / Protocol Buffers"],
        "prereqs": ["Operating Systems", "Computer Networks"],
        "objectives": ["Evaluate system trade-offs according to the CAP theorem and PACELC model", "Order concurrent distributed events using Lamport timestamps and Vector Clocks", "Implement leader election and log replication using the Raft consensus algorithm", "Coordinate distributed transactions across nodes using Two-Phase Commit"],
        "thumb": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Distributed Foundations & Time in Distributed Systems", "Network partitions and ordering events without global physical clocks.", [
                ("Characterizing Distributed Systems & The 8 Fallacies", "Partial failure, latency, network unreliability, and Byzantine faults.", "TEXT", "text"),
                ("Physical Clocks, Clock Drift & NTP / PTP", "Crystal oscillator drift, network time protocol, and TrueTime API.", "TEXT", "text"),
                ("Logical Clocks: Lamport Timestamps & Vector Clocks", "Causality tracking, happens-before relation, and detecting concurrent writes.", "CODE", "typescript"),
            ]),
            ("Consistency Models & Consensus Algorithms", "Coordinating independent computing nodes into a unified state.", [
                ("The CAP Theorem & PACELC Model", "Consistency vs Availability during partition, latency vs consistency trade-offs.", "TEXT", "text"),
                ("Strong Consistency vs Eventual Consistency", "Linearizability, sequential consistency, causal consistency, and read repairs.", "TEXT", "text"),
                ("The Raft Consensus Algorithm: Leader Election", "Terms, randomized heartbeat timers, candidate voting, and split-vote resolution.", "CODE", "typescript"),
            ]),
            ("Raft Log Replication & Fault Tolerance", "Ensuring identical state machines across servers.", [
                ("Raft Log Replication & Commit Safety", "AppendEntries RPC, log matching invariant, commit index, and state machines.", "CODE", "typescript"),
                ("Log Compaction & Snapshotting", "Memory bounds, writing snapshots to disk, and installing snapshots on lagging followers.", "CODE", "typescript"),
                ("Byzantine Fault Tolerance (BFT) Overview", "Malicious node assumptions, 3f+1 tolerance threshold, and PBFT algorithm.", "TEXT", "text"),
            ]),
            ("Distributed Transactions & RPC Frameworks", "Coordinating multi-service workflows and high-speed communication.", [
                ("Two-Phase Commit (2PC) Protocol", "Coordinator, prepare phase, commit phase, and blocking coordinator failure.", "CODE", "typescript"),
                ("Saga Pattern for Distributed Microservices", "Choreography vs orchestration, compensating transactions, and outbox pattern.", "CODE", "typescript"),
                ("High-Performance gRPC & Protocol Buffers", "Binary serialization, HTTP/2 multiplexing, streaming RPCs, and proto3 schemas.", "CODE", "protobuf"),
            ]),
        ]
    },
    {
        "num": 33, "cat_key": "categoryC", "cat_name": "Computer Science Core",
        "title": "Cloud Computing Fundamentals", "code": "CSC213", "branch": "IT", "sem": 6, "diff": "Beginner", "mins": 540,
        "short_desc": "Cloud service models (IaaS/PaaS/SaaS), virtualization, multi-region architecture, object storage, and serverless.",
        "desc": "A foundational exploration of modern cloud infrastructure. Learn virtualization hypervisors, cloud service models (IaaS, PaaS, SaaS), public/private/hybrid deployments, high-availability multi-AZ architectures, object storage buckets, and serverless compute.",
        "skills": ["Cloud Architecture", "IaaS / PaaS / SaaS", "Virtualization (KVM/Hyper-V)", "Multi-AZ High Availability", "Object Storage", "Serverless Compute"],
        "prereqs": ["Operating Systems", "Computer Networks"],
        "objectives": ["Differentiate cloud deployment and service models across business requirements", "Understand virtualization mechanisms: Type 1 bare-metal vs Type 2 hypervisors", "Architect high-availability infrastructure across multi-availability zone regions", "Deploy serverless event-driven functions responding to object store events"],
        "thumb": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Cloud Principles & Virtualization Technology", "The shift from on-premises data centers to elastic compute.", [
                ("NIST Cloud Definition & Essential Characteristics", "On-demand self-service, broad network access, resource pooling, elasticity.", "TEXT", "text"),
                ("Service Models: IaaS vs PaaS vs SaaS vs FaaS", "Shared responsibility model, management boundaries, and total cost of ownership.", "TEXT", "text"),
                ("Hardware Virtualization & Hypervisors", "Type-1 bare-metal hypervisors (ESXi, KVM) vs Type-2 (VirtualBox) and VM isolation.", "TEXT", "text"),
            ]),
            ("Compute & Storage Cloud Services", "Core building blocks of cloud infrastructure.", [
                ("Elastic Virtual Machines & Sizing Profiles", "vCPUs, RAM provisioning, instance families (compute/memory optimized), bursting.", "CODE", "bash"),
                ("Block Storage vs File Storage vs Object Storage", "IOPS and latency: EBS volumes vs EFS shared mounts vs S3 object buckets.", "TEXT", "text"),
                ("Object Store Architectures & Lifecycle Policies", "Bucket naming, S3 REST API, versioning, immutability, and tier transitions.", "CODE", "python"),
            ]),
            ("Cloud Networking & Security Perimeter", "Isolating resources inside private software-defined networks.", [
                ("Virtual Private Clouds (VPC) & Subnet Isolation", "Public subnets, private subnets, Internet Gateways, and NAT Gateways.", "TEXT", "text"),
                ("Security Groups & Network Access Control Lists (NACL)", "Stateful security groups vs stateless subnet NACLs, CIDR ingress/egress rules.", "CODE", "json"),
                ("Identity & Access Management (IAM)", "Users, groups, roles, least privilege policies, and temporary STS credentials.", "CODE", "json"),
            ]),
            ("Elasticity, High Availability & Serverless", "Building auto-scaling resilient cloud applications.", [
                ("Load Balancers & Auto Scaling Groups (ASG)", "Layer 4 NLB vs Layer 7 ALB, health checks, target groups, and scaling metrics.", "TEXT", "text"),
                ("Multi-Region Disaster Recovery Strategies", "RPO and RTO metrics, Active-Active vs Active-Passive (Pilot Light, Warm Standby).", "TEXT", "text"),
                ("Serverless FaaS & Event-Driven Workflows", "Stateless functions, cold starts, concurrency limits, and event bus bindings.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 34, "cat_key": "categoryC", "cat_name": "Computer Science Core",
        "title": "Computer Security Fundamentals", "code": "CSC214", "branch": "CSE", "sem": 6, "diff": "Intermediate", "mins": 600,
        "short_desc": "Cryptography (AES/RSA/SHA), PKI, TLS/SSL handshake, authentication, access control, and defense.",
        "desc": "The theoretical and practical foundations of information security. Master symmetric and asymmetric cryptography (AES, RSA, ECC), cryptographic hash functions, digital signatures, Public Key Infrastructure (PKI), TLS 1.3 protocol handshake, and threat modeling.",
        "skills": ["Symmetric Cryptography (AES)", "Asymmetric Cryptography (RSA)", "Hashing & SHA-256", "Public Key Infrastructure (PKI)", "TLS 1.3 Handshake", "Threat Modeling"],
        "prereqs": ["Computer Networks", "Discrete Mathematics"],
        "objectives": ["Encrypt and decrypt data using symmetric block ciphers in secure modes (AES-GCM)", "Implement public-key cryptographic operations with RSA and Elliptic Curve Cryptography", "Validate digital certificates and verify X.509 chains of trust in PKI", "Trace the cryptographic key exchange in the TLS 1.3 protocol handshake"],
        "thumb": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Foundations of Cryptography & Symmetric Encryption", "Mathematical secrets and block cipher algorithms.", [
                ("The CIA Triad & Cryptographic Primitives", "Confidentiality, Integrity, Availability, non-repudiation, and Kerckhoffs's principle.", "TEXT", "text"),
                ("Symmetric Ciphers: AES Block Structure", "Substitution-Permutation Networks, S-boxes, Key expansion, and 128/256-bit keys.", "CODE", "python"),
                ("Cipher Modes: ECB, CBC vs GCM (Authenticated Encryption)", "ECB pattern leakage, IV initialization vectors, and Galois/Counter Mode (GCM).", "CODE", "python"),
            ]),
            ("Asymmetric Cryptography & Digital Signatures", "Dual-key mathematics and mathematical proof of identity.", [
                ("Modular Arithmetic & The RSA Algorithm", "Euler's totient function, prime generation, modular inverse, and public/private keys.", "CODE", "python"),
                ("Diffie-Hellman Key Exchange & Discrete Logarithms", "Exchanging shared secrets over insecure channels and Forward Secrecy.", "CODE", "python"),
                ("Elliptic Curve Cryptography (ECC) & Digital Signatures (ECDSA)", "Weierstrass curves, point addition, smaller key sizes, and signature generation.", "CODE", "python"),
            ]),
            ("Integrity, Hashing & Public Key Infrastructure", "Message digests and the hierarchy of digital trust.", [
                ("Cryptographic Hash Functions: SHA-256 & Collisions", "One-way preimage resistance, second preimage resistance, collision resistance.", "CODE", "python"),
                ("Message Authentication Codes (HMAC)", "Keyed hashing for message integrity and tampering detection.", "CODE", "python"),
                ("Public Key Infrastructure (PKI) & X.509 Certificates", "Certificate Authorities (CA), Certificate Revocation Lists (CRL), OCSP stapling.", "TEXT", "text"),
            ]),
            ("Network Security, TLS 1.3 & Threat Modeling", "Defending communications across adversarial networks.", [
                ("The TLS 1.3 Handshake Protocol", "1-RTT handshake, Diffie-Hellman key share, server certificates, and session tickets.", "TEXT", "text"),
                ("Authentication Schemes: Kerberos & OAuth 2.0 / OIDC", "Ticket Granting Service (TGS), OAuth 2.0 authorization code flow with PKCE.", "CODE", "json"),
                ("Threat Modeling: STRIDE & Attack Trees", "Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation.", "TEXT", "text"),
            ]),
        ]
    },
    {
        "num": 35, "cat_key": "categoryC", "cat_name": "Computer Science Core",
        "title": "System Design Fundamentals", "code": "CSC215", "branch": "CSE", "sem": 7, "diff": "Advanced", "mins": 720,
        "short_desc": "Scalability, load balancing, caching (Redis), sharding, message queues (Kafka), and microservices.",
        "desc": "Architect hyperscale web systems serving millions of concurrent requests. Master horizontal scaling, Layer 4/7 load balancers, caching strategies (cache-aside, write-through), database replication and sharding, message queues (Kafka), rate limiting, and CDN edge delivery.",
        "skills": ["Scalability & High Availability", "Load Balancing (L4/L7)", "Distributed Caching (Redis)", "Database Sharding & Replication", "Message Brokers (Kafka)", "System Design Interviews"],
        "prereqs": ["Operating Systems", "Computer Networks", "Database Management Systems"],
        "objectives": ["Design high-throughput systems capable of handling 100k+ queries per second", "Implement distributed caching patterns with Redis and resolve cache stampedes", "Partition relational and NoSQL databases horizontally using consistent hashing", "Decouple microservices using asynchronous message streaming brokers like Apache Kafka"],
        "thumb": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Scalability Foundations & Load Balancing", "Scaling web architectures from 1 to 10 million users.", [
                ("Vertical vs Horizontal Scaling & Bottlenecks", "Stateless services, single points of failure (SPOF), and Amdahl's Law.", "TEXT", "text"),
                ("Load Balancers: Layer 4 vs Layer 7 Architecture", "Round Robin, Weighted Least Connections, IP Hash, and TLS termination.", "TEXT", "text"),
                ("Consistent Hashing & Ring Partitions", "Virtual nodes, eliminating data redistribution during node join/leave, DynamoDB.", "CODE", "typescript"),
            ]),
            ("Distributed Caching & Content Delivery", "Sub-millisecond latency retrieval for hot read paths.", [
                ("Caching Strategies: Cache-Aside, Write-Through, Write-Behind", "Cache invalidation trade-offs, read-through patterns, and TTL expiration.", "CODE", "typescript"),
                ("Cache Stampede, Cache Penetration & Bloom Filters", "Mutex locks, probabilistic early expiration, and Bloom filter membership queries.", "CODE", "typescript"),
                ("Content Delivery Networks (CDN) & Edge Caching", "Edge points of presence (PoP), anycast DNS routing, and static asset acceleration.", "TEXT", "text"),
            ]),
            ("Database Scaling: Replication & Sharding", "Handling petabyte-scale persistent relational data.", [
                ("Primary-Replica Database Replication", "Synchronous vs asynchronous replication, read scaling, and replication lag.", "TEXT", "text"),
                ("Database Sharding & Partition Keys", "Range-based sharding, directory-based sharding, and cross-shard join challenges.", "CODE", "sql"),
                ("NoSQL Storage Architectures: Key-Value, Document, Columnar", "LSM-Trees vs B+ Trees, SSTables, write-heavy vs read-heavy workloads.", "TEXT", "text"),
            ]),
            ("Asynchronous Messaging & Real-World System Design", "Decoupling components and end-to-end design blueprints.", [
                ("Message Queues vs Event Streams: RabbitMQ vs Apache Kafka", "Log-based message queues, consumer groups, offsets, and at-least-once delivery.", "CODE", "typescript"),
                ("Designing a Distributed URL Shortener (TinyURL)", "Capacity estimation, base62 encoding, MD5 hashing, collision handling, caching.", "CODE", "typescript"),
                ("Designing a Scalable Rate Limiter", "Sliding window counter algorithm, Redis sorted sets, and distributed locks.", "CODE", "typescript"),
            ]),
        ]
    },
]

print(f"Loaded {len(COURSES_A)} Category A courses, {len(COURSES_B)} Category B courses, and {len(COURSES_C)} Category C courses.")

