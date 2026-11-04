import os
import json
import re

print("Starting Course Catalog Generator...")

# 10 Categories and 100 Courses Metadata
# Each course has:
# - id: crs_cat_{num:03d}
# - num: 1..100
# - title: Title
# - code: Code
# - category: Category
# - branch: Branch
# - semester: Semester
# - difficulty: Beginner/Intermediate/Advanced
# - estimated_minutes: Minutes (e.g. 480 to 720)
# - short_desc: Brief description
# - desc: Detailed description
# - skills: [skills]
# - prereqs: [prereqs]
# - objectives: [objectives]
# - modules: 4 modules, each with 3 lessons (title, desc, type, code_lang, content_focus)

COURSE_DEFS = [
    # ------------------ CATEGORY A: Programming Fundamentals (1..10) ------------------
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

print(f"Loaded {len(COURSE_DEFS)} course baseline definitions so far.")
