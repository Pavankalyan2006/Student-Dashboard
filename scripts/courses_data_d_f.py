# Courses 36 to 70: Categories D, E, F

COURSES_D = [
    {
        "num": 36, "cat_key": "categoryD", "cat_name": "Artificial Intelligence and Machine Learning",
        "title": "Artificial Intelligence Fundamentals", "code": "AIM301", "branch": "AIML", "sem": 5, "diff": "Beginner", "mins": 560,
        "short_desc": "Intelligent agents, state space search (A*, minimax, alpha-beta pruning), CSPs, and knowledge representation.",
        "desc": "A foundational curriculum in artificial intelligence. Study rational agents, uninformed and heuristic state space search (BFS, DFS, A*, IDA*), adversarial game search (Minimax with Alpha-Beta pruning), Constraint Satisfaction Problems (CSP), and propositional logic inference.",
        "skills": ["State Space Search", "A* Search Algorithm", "Adversarial Search (Minimax)", "Alpha-Beta Pruning", "CSP & Backtracking", "Knowledge Inference"],
        "prereqs": ["Discrete Mathematics", "Data Structures Fundamentals"],
        "objectives": ["Formulate problems into formal state spaces, transition functions, and heuristic functions", "Implement the A* algorithm and prove admissibility and consistency invariants", "Construct game trees and optimize decision-making using Alpha-Beta pruning", "Solve Constraint Satisfaction Problems using AC-3 arc consistency and MRV heuristics"],
        "thumb": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Intelligent Agents & Problem Formulation", "Rational agents and environmental taxonomy.", [
                ("Agents, Environments & PEAS Taxonomy", "Performance measures, Environment, Actuators, Sensors, and agent architectures.", "TEXT", "text"),
                ("State Space Formulation & Graph Search", "States, actions, transition models, path cost, and repeated state avoidance.", "CODE", "python"),
                ("Uninformed Search: BFS, DFS, UCS & Depth-Limited", "Completeness, time and space complexity, and uniform-cost Dijkstra search.", "CODE", "python"),
            ]),
            ("Informed Search & Heuristic Optimization", "Using domain knowledge to guide search exploration.", [
                ("Heuristic Functions & Greedy Best-First Search", "Estimating remaining cost h(n), heuristic admissibility, and Manhattan distance.", "CODE", "python"),
                ("The A* Search Algorithm & Consistency Proofs", "f(n) = g(n) + h(n), monotone/consistency property, and optimality proof.", "CODE", "python"),
                ("Memory-Bounded Search: IDA* & RBFS", "Iterative deepening A*, recursive best-first search, and memory trade-offs.", "CODE", "python"),
            ]),
            ("Adversarial Search & Game Playing", "Deterministic zero-sum two-player games.", [
                ("Game Trees & The Minimax Decision Rule", "Max/Min nodes, terminal utilities, backed-up values, and ply depth limits.", "CODE", "python"),
                ("Alpha-Beta Pruning Invariants", "Alpha bounds, beta cutoffs, move ordering, and reducing effective branching factor.", "CODE", "python"),
                ("Evaluation Functions & Quiescence Search", "Heuristic static evaluation, horizon effect, and quiescence search extensions.", "CODE", "python"),
            ]),
            ("Constraint Satisfaction & Logic Representation", "Declarative constraint solving and symbolic knowledge bases.", [
                ("Constraint Satisfaction Problems (CSP) & Backtracking", "Variables, domains, binary constraints, and Minimum Remaining Values (MRV).", "CODE", "python"),
                ("Arc Consistency & The AC-3 Algorithm", "Constraint propagation, domain filtering, and forward checking.", "CODE", "python"),
                ("Propositional Logic & Resolution Theorem Proving", "CNF conversion, resolution inference rule, and forward/backward chaining.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 37, "cat_key": "categoryD", "cat_name": "Artificial Intelligence and Machine Learning",
        "title": "Machine Learning Fundamentals", "code": "AIM302", "branch": "AIML", "sem": 5, "diff": "Intermediate", "mins": 620,
        "short_desc": "Machine learning lifecycle, inductive bias, parametric vs non-parametric models, and validation.",
        "desc": "Foundational theory and core workflows of machine learning. Learn inductive learning principles, the bias-variance trade-off, maximum likelihood estimation (MLE), train/validation/test splits, k-fold cross validation, evaluation metrics, and overfitting mitigations.",
        "skills": ["ML Lifecycle", "Bias-Variance Trade-off", "Maximum Likelihood (MLE)", "Cross Validation", "Evaluation Metrics (ROC/AUC)", "Regularization"],
        "prereqs": ["Linear Algebra", "Python Programming Fundamentals"],
        "objectives": ["Formulate machine learning problems under supervised, unsupervised, and reinforcement paradigms", "Deconstruct model error into bias, variance, and irreducible error components", "Execute rigorous cross-validation and hyperparameter tuning pipelines", "Evaluate classifiers using confusion matrices, precision-recall curves, and ROC-AUC"],
        "thumb": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Machine Learning Paradigms & Foundations", "Inductive reasoning and mathematical formalization.", [
                ("Taxonomy of ML: Supervised, Unsupervised, Reinforcement", "Input features, target spaces, reward signals, and inductive bias.", "TEXT", "text"),
                ("Hypothesis Spaces, PAC Learning & Generalization", "Probably Approximately Correct (PAC) framework, sample complexity bounds.", "TEXT", "text"),
                ("Empirical Risk Minimization & Loss Functions", "Expected risk, empirical surrogate loss, zero-one loss, and convexity.", "CODE", "python"),
            ]),
            ("The Bias-Variance Decomposition", "Diagnosing underfitting and overfitting in predictive models.", [
                ("Mathematical Derivation of Bias-Variance Trade-Off", "Decomposing Mean Squared Error into Bias^2 + Variance + Noise sigma^2.", "TEXT", "text"),
                ("High Bias (Underfitting) vs High Variance (Overfitting)", "Learning curves, training vs validation error divergence, and mitigation paths.", "CODE", "python"),
                ("Model Complexity & Occam's Razor", "Model capacity, parameter counts, structural risk minimization, and VC-dimension.", "TEXT", "text"),
            ]),
            ("Model Validation & Hyperparameter Tuning", "Preventing data leakage and optimizing configuration parameters.", [
                ("Data Splitting: Train, Dev, Test & Stratified K-Fold", "Avoiding data leakage, time-series splits, and stratified fold balancing.", "CODE", "python"),
                ("Hyperparameter Optimization: Grid, Random & Bayesian Search", "Exhaustive grid search vs random sampling vs Gaussian process optimization.", "CODE", "python"),
                ("Feature Scaling & Preprocessing Pipelines", "Standardization (z-score), Min-Max normalization, and Scikit-Learn Pipeline.", "CODE", "python"),
            ]),
            ("Classification & Regression Metrics", "Quantifying predictive fidelity across problem domains.", [
                ("Classification Metrics: Precision, Recall, F1 & Macro/Micro", "Type I and Type II errors, confusion matrix, harmonic mean F-beta.", "CODE", "python"),
                ("ROC Curves & Area Under the Curve (AUC)", "True Positive Rate vs False Positive Rate, thresholding, and PR curves.", "CODE", "python"),
                ("Regression Metrics: MSE, RMSE, MAE & R-Squared", "Residual analysis, heteroscedasticity, and coefficient of determination.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 38, "cat_key": "categoryD", "cat_name": "Artificial Intelligence and Machine Learning",
        "title": "Supervised Machine Learning", "code": "AIM303", "branch": "AIML", "sem": 6, "diff": "Intermediate", "mins": 640,
        "short_desc": "Linear regression, Logistic regression, SVMs, Decision Trees, Random Forests, and Gradient Boosting (XGBoost).",
        "desc": "Master industrial supervised learning algorithms. Explore ordinary least squares (OLS), Ridge/Lasso regularization, logistic regression log-odds, Support Vector Machines (dual formulation, kernel trick), Decision Trees (CART), Random Forest bagging, and XGBoost gradient boosting.",
        "skills": ["Linear Regression (OLS)", "Logistic Regression", "Support Vector Machines (SVM)", "Decision Trees (CART)", "Random Forests", "XGBoost & LightGBM"],
        "prereqs": ["Machine Learning Fundamentals"],
        "objectives": ["Derive closed-form OLS normal equations and gradient descent weight updates", "Train regularized classification models with L1 (Lasso) and L2 (Ridge) penalties", "Understand maximal margin hyperplanes and kernel transformations in SVMs", "Build high-accuracy ensemble models using Random Forests and Gradient Boosted Trees"],
        "thumb": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Linear Regression & Regularization", "Continuous target prediction with linear parameter combinations.", [
                ("Ordinary Least Squares (OLS) & Normal Equations", "Matrix derivation of beta = (X^T X)^-1 X^T y and computational cost.", "CODE", "python"),
                ("Batch, Stochastic & Mini-Batch Gradient Descent", "Learning rate scheduling, convergence criteria, and loss surfaces.", "CODE", "python"),
                ("Ridge (L2) & Lasso (L1) Regularization", "Shrinkage penalties, sparsity inducement with L1 corners, and Elastic Net.", "CODE", "python"),
            ]),
            ("Logistic Regression & Support Vector Machines", "Linear and non-linear classification boundaries.", [
                ("Logistic Regression & Maximum Likelihood Estimation", "Sigmoid activation, log-odds logit function, and binary cross-entropy loss.", "CODE", "python"),
                ("Support Vector Machines: Hard & Soft Margin", "Geometric margin, support vectors, slack variables, and hinge loss.", "CODE", "python"),
                ("The Kernel Trick: RBF, Polynomial & Mercer's Theorem", "Implicit mapping to infinite-dimensional Hilbert spaces and kernel Gram matrix.", "CODE", "python"),
            ]),
            ("Tree-Based Models: CART & Pruning", "Hierarchical recursive decision partitioning.", [
                ("Decision Trees: Entropy, Information Gain & Gini Impurity", "Shannon entropy, Gini index calculations, and recursive splitting.", "CODE", "python"),
                ("Continuous Feature Splitting & Multiway Branches", "Sorting thresholds, handling missing features, and regression tree variance.", "CODE", "python"),
                ("Tree Overfitting & Cost-Complexity Pruning", "Max depth, min samples split, and minimal cost-complexity pruning (ccp_alpha).", "CODE", "python"),
            ]),
            ("Ensemble Learning: Bagging & Boosting", "Combining weak learners into high-performance models.", [
                ("Bootstrap Aggregation (Bagging) & Random Forests", "Out-of-bag (OOB) error estimation, random feature subsampling, and feature importance.", "CODE", "python"),
                ("Adaptive Boosting (AdaBoost)", "Reweighting misclassified instances, weak learner weighting, and exponential loss.", "CODE", "python"),
                ("Gradient Boosted Decision Trees (GBDT) & XGBoost", "Residual fitting, second-order Taylor expansion, regularization in XGBoost.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 39, "cat_key": "categoryD", "cat_name": "Artificial Intelligence and Machine Learning",
        "title": "Unsupervised Machine Learning", "code": "AIM304", "branch": "AIML", "sem": 6, "diff": "Intermediate", "mins": 580,
        "short_desc": "K-Means, Hierarchical clustering, DBSCAN, PCA dimensionality reduction, t-SNE, and Gaussian Mixtures.",
        "desc": "Discover hidden structures in unlabeled datasets. Master partitioning algorithms (K-Means++), density-based clustering (DBSCAN), hierarchical agglomerative clustering, Gaussian Mixture Models (EM algorithm), Principal Component Analysis (PCA), and t-SNE / UMAP visualization.",
        "skills": ["K-Means++ Clustering", "DBSCAN", "Hierarchical Clustering", "Gaussian Mixture Models (EM)", "PCA", "t-SNE & UMAP"],
        "prereqs": ["Machine Learning Fundamentals", "Linear Algebra"],
        "objectives": ["Implement K-Means clustering and select optimal k using the Elbow and Silhouette methods", "Identify arbitrarily shaped spatial clusters and noise outliers using DBSCAN", "Derive Principal Component Analysis (PCA) using eigenvalue decomposition and SVD", "Model multi-modal probabilistic data distributions using Gaussian Mixture Models and EM"],
        "thumb": "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Partitioning & Centroid Clustering", "Grouping data points around geometric prototypes.", [
                ("K-Means Algorithm & Convergence Proof", "Lloyd's algorithm, Voronoi cells, objective function (WCSS), and local minima.", "CODE", "python"),
                ("K-Means++ Seeding & Cluster Validation", "Probabilistic distance-proportional initialization, Elbow method, Silhouette score.", "CODE", "python"),
                ("K-Medoids & PAM (Partitioning Around Medoids)", "Robustness to extreme outliers and arbitrary distance metric support.", "CODE", "python"),
            ]),
            ("Density-Based & Hierarchical Clustering", "Handling arbitrary geometries, noise, and nested hierarchies.", [
                ("DBSCAN: Density-Based Spatial Clustering", "Epsilon neighborhoods, minPts, core points, border points, and noise.", "CODE", "python"),
                ("Hierarchical Agglomerative Clustering & Dendrograms", "Single, complete, average, and Ward linkage criteria, cut heights.", "CODE", "python"),
                ("HDBSCAN & Varying Density Clustering", "Minimum spanning tree mutual reachability distance and stable cluster selection.", "CODE", "python"),
            ]),
            ("Linear Dimensionality Reduction", "Projecting high-dimensional data onto maximal variance subspaces.", [
                ("Principal Component Analysis (PCA) Mathematical Derivation", "Covariance matrix, eigenvalue decomposition, and maximizing projected variance.", "TEXT", "python"),
                ("Singular Value Decomposition (SVD) & Truncated SVD", "X = U Sigma V^T factorization, low-rank approximation, and scree plots.", "CODE", "python"),
                ("Linear Discriminant Analysis (LDA)", "Supervised dimensionality reduction, Fisher's criterion, between/within scatter.", "CODE", "python"),
            ]),
            ("Probabilistic Clustering & Non-Linear Embeddings", "Soft cluster assignment and high-dimensional visualization.", [
                ("Gaussian Mixture Models (GMM) & Expectation-Maximization", "E-step posterior calculation, M-step parameter updates, covariance matrices.", "CODE", "python"),
                ("t-SNE (t-Distributed Stochastic Neighbor Embedding)", "KL-divergence minimization, Student-t heavy tails, and perplexity tuning.", "CODE", "python"),
                ("UMAP (Uniform Manifold Approximation and Projection)", "Riemannian geometry, fuzzy simplicial sets, and preserving global structure.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 40, "cat_key": "categoryD", "cat_name": "Artificial Intelligence and Machine Learning",
        "title": "Deep Learning Fundamentals", "code": "AIM305", "branch": "AIML", "sem": 6, "diff": "Advanced", "mins": 680,
        "short_desc": "Deep neural architectures, backpropagation calculus, PyTorch, optimizers (AdamW), and regularization (Dropout).",
        "desc": "The architectural engine of modern artificial intelligence. Master multi-layer perceptrons, forward propagation, computational graphs, backpropagation calculus, activation functions (ReLU, GELU), modern optimizers (Adam, AdamW), Batch Normalization, and PyTorch tensors.",
        "skills": ["Deep Neural Networks", "Backpropagation Calculus", "PyTorch Framework", "Optimizers (AdamW, SGD)", "Batch Normalization", "Dropout & Weight Decay"],
        "prereqs": ["Linear Algebra", "Supervised Machine Learning", "Python for Engineers"],
        "objectives": ["Compute analytical gradients for deep computational graphs using backpropagation", "Build, train, and validate deep neural network architectures using PyTorch", "Stabilize training dynamics using Batch Normalization, Layer Normalization, and Dropout", "Tune learning rates using AdamW optimizers and Cosine Annealing schedulers"],
        "thumb": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Neural Network Foundations & Forward Pass", "Bio-inspired computational units and non-linear mappings.", [
                ("The Biological vs Artificial Neuron & Perceptron", "Weighted inputs, biases, linear activation, and the XOR limitation.", "TEXT", "text"),
                ("Activation Functions: Sigmoid, Tanh, ReLU & GELU", "Vanishing gradients, dying ReLU, Leaky ReLU, smooth Gaussian Error Linear Units.", "CODE", "python"),
                ("Forward Propagation & Matrix Operations", "Batch tensor dot products, hidden layers, and Softmax output probabilities.", "CODE", "python"),
            ]),
            ("Backpropagation Calculus & AutoDiff", "Computing exact parameter gradients via the multivariable chain rule.", [
                ("Computational Graphs & Directed Reverse-Mode AutoDiff", "Scalar vs tensor backprop, dynamic computation graphs in PyTorch.", "TEXT", "text"),
                ("Deriving Backpropagation via the Matrix Chain Rule", "Loss gradients with respect to weights, biases, and intermediate activations.", "CODE", "python"),
                ("Vanishing & Exploding Gradient Dynamics", "Spectral radius of weight matrices, gradient clipping, and Xavier/He initialization.", "CODE", "python"),
            ]),
            ("Modern Optimization Algorithms", "Navigating high-dimensional non-convex loss surfaces.", [
                ("Stochastic Gradient Descent with Momentum", "Oscillation dampening, exponential moving averages, and Nesterov momentum.", "CODE", "python"),
                ("Adaptive Optimizers: RMSprop, Adam & AdamW", "First and second raw moments, bias correction, decoupled weight decay in AdamW.", "CODE", "python"),
                ("Learning Rate Schedulers: Warmup & Cosine Annealing", "Linear warmup, 1cycle policy, cosine annealing decay, and reduce-on-plateau.", "CODE", "python"),
            ]),
            ("Deep Regularization & PyTorch Workflow", "Building robust generalizable models with standard frameworks.", [
                ("Batch Normalization vs Layer Normalization", "Internal covariate shift, running mean/variance, batch vs channel normalization.", "CODE", "python"),
                ("Dropout, Weight Decay & Data Augmentation", "Inverted dropout, L2 weight decay equivalence, and stochastic regularizers.", "CODE", "python"),
                ("PyTorch Pipeline: Datasets, DataLoaders & Training Loops", "torch.nn.Module, Dataset class, DataLoader workers, and training loop structure.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 41, "cat_key": "categoryD", "cat_name": "Artificial Intelligence and Machine Learning",
        "title": "Neural Networks", "code": "AIM306", "branch": "AIML", "sem": 6, "diff": "Intermediate", "mins": 600,
        "short_desc": "Perceptrons, Multi-Layer Perceptrons (MLP), loss surfaces, Hessian matrices, and Universal Approximation.",
        "desc": "An in-depth mathematical exploration of neural representations. Study the Universal Approximation Theorem, loss landscape geometry (saddle points, local minima), Hessian matrices, second-order optimization methods (L-BFGS), and initialization theorems.",
        "skills": ["Universal Approximation", "Loss Landscape Geometry", "Hessian & Curvature", "Weight Initialization", "Multi-Layer Perceptrons"],
        "prereqs": ["Linear Algebra", "Deep Learning Fundamentals"],
        "objectives": ["Prove the Universal Approximation Theorem for single-hidden-layer feedforward networks", "Analyze loss surface curvature using Hessian matrices and eigenvalues", "Derive Xavier/Glorot and He/Kaiming initialization formulas from variance preservation", "Implement Multi-Layer Perceptrons from scratch using pure NumPy matrix operations"],
        "thumb": "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Representation Capacity & Theorems", "The expressive power of deep feedforward networks.", [
                ("Cybenko's Universal Approximation Theorem", "Density of sigmoidal sums in continuous spaces and squashing functions.", "TEXT", "text"),
                ("Depth vs Width Trade-Offs in Neural Architectures", "Exponential expressive efficiency of deep networks over shallow networks.", "TEXT", "text"),
                ("Linear vs Non-Linear Decision Boundaries", "Hyperplane partitioning, polyhedral decision regions, and network capacity.", "CODE", "python"),
            ]),
            ("Weight Initialization & Variance Scaling", "Preserving signal variance across hundreds of sequential layers.", [
                ("Random Initialization Pitfalls: Zero & Large Weights", "Symmetry breaking, saturation of activations, and gradient vanishing.", "CODE", "python"),
                ("Xavier / Glorot Initialization Derivation", "Variance preservation for symmetric activations (tanh, sigmoid): Var(W) = 2/(fan_in + fan_out).", "CODE", "python"),
                ("He / Kaiming Initialization for Rectified Units", "Variance scaling for ReLU non-linearities: Var(W) = 2/fan_in.", "CODE", "python"),
            ]),
            ("Loss Surfaces, Curvature & Optimization Geometry", "The geometry of deep learning optimization spaces.", [
                ("Loss Landscapes: Local Minima vs Saddle Points", "High-dimensional topology, escaping saddle points, and plateaus.", "TEXT", "text"),
                ("The Hessian Matrix & Condition Numbers", "Second-order Taylor expansion, ill-conditioning, and curvature along eigenvectors.", "CODE", "python"),
                ("Second-Order Optimization: Newton's Method & L-BFGS", "Inverse Hessian computation, quasi-Newton approximations, and computational barriers.", "CODE", "python"),
            ]),
            ("Pure NumPy Neural Engine Implementation", "Building deep learning from absolute scratch without external ML frameworks.", [
                ("Vectorized Layer Architecture & Matrix Multiplication", "Forward pass encapsulation with NumPy broadcasting and batch tensors.", "CODE", "python"),
                ("Analytical Backward Pass & Gradient Accumulation", "Manual chain rule backward methods for Linear, ReLU, and Softmax layers.", "CODE", "python"),
                ("End-to-End Training Harness & Numerical Gradient Checking", "Finite difference numerical gradient checks to verify analytical backprop.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 42, "cat_key": "categoryD", "cat_name": "Artificial Intelligence and Machine Learning",
        "title": "Natural Language Processing", "code": "AIM307", "branch": "AIML", "sem": 7, "diff": "Advanced", "mins": 660,
        "short_desc": "Tokenization (BPE), word embeddings (Word2Vec), RNNs, LSTMs, GRUs, Seq2Seq, and Attention mechanisms.",
        "desc": "Computational linguistic processing and deep sequential modeling. Master text preprocessing, Byte-Pair Encoding (BPE), Word2Vec (Skip-gram and CBOW), Recurrent Neural Networks (RNN), Long Short-Term Memory (LSTM) gating, Seq2Seq translation, and Bahdanau additive attention.",
        "skills": ["Tokenization (BPE)", "Word2Vec / GloVe", "Recurrent Networks (RNN)", "LSTM / GRU Gating", "Seq2Seq Architecture", "Attention Mechanisms"],
        "prereqs": ["Deep Learning Fundamentals"],
        "objectives": ["Tokenize raw corpora using Byte-Pair Encoding (BPE) and subword algorithms", "Train dense semantic word embeddings using Word2Vec and negative sampling", "Implement LSTM and GRU memory cell gating to prevent vanishing gradients over time", "Construct Sequence-to-Sequence neural machine translation models with Attention"],
        "thumb": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Text Representations & Subword Tokenization", "Converting unstructured linguistic characters into numerical tensors.", [
                ("Text Normalization, Lemmatization & Stemming", "Regex cleaning, vocabulary out-of-vocabulary (OOV) challenges.", "CODE", "python"),
                ("Subword Tokenization: Byte-Pair Encoding (BPE) & WordPiece", "Frequency merge pairs, vocabulary size bounds, and huggingface tokenizers.", "CODE", "python"),
                ("Word Embeddings: Word2Vec (Skip-Gram & CBOW)", "Distributional hypothesis, negative sampling objective, and cosine similarity.", "CODE", "python"),
            ]),
            ("Recurrent Neural Networks (RNN)", "Sequential feedback loops for modeling temporal text dependencies.", [
                ("Vanilla RNN Cell Architecture & Unrolling in Time", "Hidden state transitions h_t = tanh(W_hh h_t-1 + W_xh x_t), BPTT.", "CODE", "python"),
                ("Backpropagation Through Time (BPTT) & Exploding Gradients", "Vanishing gradient proofs across time steps, gradient norm clipping.", "TEXT", "python"),
                ("Bi-Directional RNNs & Multi-Layer RNN Stacks", "Forward and backward contextual integration and sequence classification.", "CODE", "python"),
            ]),
            ("Gated Architectures: LSTM & GRU", "Solving long-term temporal dependencies with additive cell highways.", [
                ("Long Short-Term Memory (LSTM) Architecture", "Cell state C_t, Forget gate f_t, Input gate i_t, Output gate o_t.", "CODE", "python"),
                ("Gated Recurrent Unit (GRU): Reset & Update Gates", "Streamlined gating, merged hidden states, and parameter efficiency.", "CODE", "python"),
                ("Language Modeling & Autoregressive Text Generation", "Predicting next tokens, perplexity metric, greedy search vs top-k sampling.", "CODE", "python"),
            ]),
            ("Seq2Seq & Attention Mechanism", "Transforming variable-length input sequences to variable-length outputs.", [
                ("Encoder-Decoder Architecture for Machine Translation", "Context vector bottleneck, teacher forcing during training, and inference loops.", "CODE", "python"),
                ("Bahdanau Additive Attention & Luong Multiplicative Attention", "Alignment scores, attention weights softmax, dynamic context vectors.", "CODE", "python"),
                ("Beam Search Decoding & BLEU Score Evaluation", "Beam width k, length normalization, n-gram precision, and BLEU-4 metrics.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 43, "cat_key": "categoryD", "cat_name": "Artificial Intelligence and Machine Learning",
        "title": "Computer Vision", "code": "AIM308", "branch": "AIML", "sem": 7, "diff": "Advanced", "mins": 680,
        "short_desc": "Convolutional Neural Networks (CNNs), ResNet, Object Detection (YOLO), semantic segmentation, and OpenCV.",
        "desc": "Extract semantic representations from visual pixel matrices. Master digital image filtering with OpenCV, Convolutional layers, pooling, classic architectures (LeNet, VGG, ResNet skip connections), real-time object detection (YOLO), and semantic image segmentation (U-Net).",
        "skills": ["Convolution Operations", "ResNet & Skip Connections", "Object Detection (YOLO)", "Semantic Segmentation (U-Net)", "OpenCV Image Processing", "Transfer Learning"],
        "prereqs": ["Deep Learning Fundamentals"],
        "objectives": ["Implement convolution, padding, stride, and pooling operations from mathematical definitions", "Train deep residual networks (ResNet) using identity skip connections to solve degradation", "Detect objects in real time using anchor boxes, IoU, and Non-Maximum Suppression (YOLO)", "Segment biomedical and satellite images pixel-by-pixel using U-Net skip architectures"],
        "thumb": "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Digital Image Processing & OpenCV Foundations", "Spatial domain image processing and morphological operations.", [
                ("Image Representation: Tensors, Color Spaces (RGB, HSV)", "Grayscale intensity, channel transformations, OpenCV numpy matrix operations.", "CODE", "python"),
                ("Spatial Filtering: Gaussian Blur, Sobel & Canny Edges", "Convolution kernels, gradient magnitudes, and hysteresis thresholding.", "CODE", "python"),
                ("Image Augmentation Pipelines (Albumentations)", "Affine transforms, random crops, color jittering, and spatial transformations.", "CODE", "python"),
            ]),
            ("Convolutional Neural Networks (CNN) Architecture", "Spatial feature hierarchies and translation invariance.", [
                ("Convolution Layer: Kernels, Stride, Padding & Receptive Fields", "Output feature map size formula: (W - K + 2P)/S + 1, parameter sharing.", "CODE", "python"),
                ("Pooling Operations: Max Pooling vs Average Pooling", "Downsampling feature maps, spatial invariance, and global average pooling.", "CODE", "python"),
                ("Classic CNN Architectures: AlexNet, VGG-16 & Inception", "Stacking small 3x3 filters, parameter counts, and 1x1 bottleneck convolutions.", "TEXT", "python"),
            ]),
            ("Deep Residual Networks & Transfer Learning", "Scaling visual networks past 100 layers without degradation.", [
                ("The Degradation Problem & ResNet Skip Connections", "Identity mappings F(x) + x, gradient highway preservation, and bottleneck blocks.", "CODE", "python"),
                ("Transfer Learning & Fine-Tuning Pretrained Models", "Feature extraction vs fine-tuning, freezing backbone layers in PyTorch torchvision.", "CODE", "python"),
                ("Vision Transformers (ViT) Overview", "Patch embeddings, linear projections, self-attention across image patches.", "TEXT", "python"),
            ]),
            ("Object Detection & Semantic Segmentation", "Localizing and classifying multiple visual entities.", [
                ("Object Detection Foundations: Bounding Boxes, IoU & mAP", "Intersection over Union (IoU), anchor boxes, Mean Average Precision (mAP).", "CODE", "python"),
                ("Single-Stage Detectors: YOLO Architecture", "Grid cell predictions, objectness confidence, class probabilities, and NMS.", "CODE", "python"),
                ("Semantic Segmentation with U-Net", "Encoder-decoder contraction/expansion paths, skip connections, and Dice loss.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 44, "cat_key": "categoryD", "cat_name": "Artificial Intelligence and Machine Learning",
        "title": "Generative AI Fundamentals", "code": "AIM309", "branch": "AIML", "sem": 7, "diff": "Intermediate", "mins": 620,
        "short_desc": "Generative modeling principles: VAEs, GANs, Diffusion models, latent spaces, and generative evaluation.",
        "desc": "The foundational mathematical and computational paradigms of generative artificial intelligence. Compare explicit vs implicit density models, Variational Autoencoders (VAEs with reparameterization trick), Generative Adversarial Networks (GANs min-max game), and Denoising Diffusion Probabilistic Models (DDPM).",
        "skills": ["Generative Modeling", "Variational Autoencoders (VAEs)", "GANs & Min-Max Games", "Diffusion Models (DDPM)", "Latent Space Arithmetic", "FID Score"],
        "prereqs": ["Deep Learning Fundamentals", "Probability and Statistics"],
        "objectives": ["Differentiate discriminative vs generative machine learning models mathematically", "Implement Variational Autoencoders with KL-divergence regularization and reparameterization", "Train Generative Adversarial Networks and diagnose mode collapse and vanishing gradients", "Understand the forward and reverse Markov diffusion processes in Diffusion Models"],
        "thumb": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Generative Modeling Foundations & Autoencoders", "Density estimation and compressed latent representations.", [
                ("Generative vs Discriminative Models: Joint p(x,y) vs Conditional p(y|x)", "Explicit vs implicit density modeling, likelihood-based paradigms.", "TEXT", "text"),
                ("Standard Autoencoders & Dimensionality Bottlenecks", "Encoder, bottleneck latent code z, decoder reconstruction loss MSE.", "CODE", "python"),
                ("Latent Space Manifolds & Linear Interpolation", "Vector arithmetic in latent space, spherical linear interpolation (slerp).", "CODE", "python"),
            ]),
            ("Variational Autoencoders (VAE)", "Probabilistic latent spaces and variational inference.", [
                ("Variational Inference & The Evidence Lower Bound (ELBO)", "Kullback-Leibler divergence D_KL(q(z|x) || p(z)), reconstruction vs prior matching.", "TEXT", "text"),
                ("The Reparameterization Trick: z = mu + sigma * epsilon", "Allowing backpropagation through stochastic sampling nodes.", "CODE", "python"),
                ("Training VAEs & Beta-VAE Disentangled Latents", "Balancing reconstruction fidelity and latent disentanglement hyperparameter beta.", "CODE", "python"),
            ]),
            ("Generative Adversarial Networks (GAN)", "Minimax two-player zero-sum neural games.", [
                ("The GAN Minimax Objective Function", "min_G max_D V(D, G), discriminator binary classification vs generator deception.", "TEXT", "text"),
                ("Deep Convolutional GANs (DCGAN) Architecture", "Fractionally-strided convolutions, batch norm guidelines, and leaky ReLUs.", "CODE", "python"),
                ("GAN Training Dynamics: Mode Collapse & Wasserstein GAN (WGAN)", "Earth Mover's distance, 1-Lipschitz continuity, gradient penalty (WGAN-GP).", "CODE", "python"),
            ]),
            ("Diffusion Models & Generative Evaluation", "State-of-the-art visual generation and metrics.", [
                ("Denoising Diffusion Probabilistic Models (DDPM) Foundations", "Forward noise addition Markov chain q(x_t | x_t-1) and reverse denoising p(x_t-1 | x_t).", "TEXT", "text"),
                ("Score-Based Generative Models & U-Net Noise Estimators", "Predicting injected Gaussian noise epsilon using time-conditioned U-Net.", "CODE", "python"),
                ("Evaluating Generative Models: Inception Score (IS) & FID", "Fréchet Inception Distance feature distribution covariance matching.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 45, "cat_key": "categoryD", "cat_name": "Artificial Intelligence and Machine Learning",
        "title": "Large Language Models", "code": "AIM310", "branch": "AIML", "sem": 7, "diff": "Advanced", "mins": 720,
        "short_desc": "Transformer architecture, Multi-Head Attention, RoPE, Pretraining, Fine-Tuning (LoRA), and RLHF alignment.",
        "desc": "The architectural foundation of contemporary generative AI. Master Transformer encoder/decoder structures, scaled dot-product attention, multi-head attention (MHA, GQA), Rotary Position Embeddings (RoPE), pretraining on petabyte corpora, parameter-efficient fine-tuning (LoRA, QLoRA), and RLHF/DPO alignment.",
        "skills": ["Transformer Architecture", "Multi-Head Attention", "Rotary Positional Embeddings (RoPE)", "LoRA / QLoRA Fine-Tuning", "RLHF & DPO Alignment", "KV Caching"],
        "prereqs": ["Natural Language Processing", "Deep Learning Fundamentals"],
        "objectives": ["Implement scaled dot-product attention and multi-head attention blocks from scratch", "Understand FlashAttention and KV-caching optimizations during autoregressive decoding", "Fine-tune foundation models on custom datasets using LoRA and QLoRA quantization", "Explain model alignment procedures using RLHF, PPO, and Direct Preference Optimization (DPO)"],
        "thumb": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("The Transformer Architecture & Self-Attention", "Eliminating recurrence through parallelized self-attention.", [
                ("Scaled Dot-Product Attention: Q, K, V Projections", "Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V derivation and matrix sizing.", "CODE", "python"),
                ("Multi-Head Attention (MHA), MQA & Grouped-Query Attention (GQA)", "Parallel attention heads, projection weights, and memory bandwidth efficiency.", "CODE", "python"),
                ("Positional Encodings: Sinusoidal vs Rotary (RoPE)", "Preserving relative token distances, rotary rotation matrix properties in modern LLMs.", "CODE", "python"),
            ]),
            ("Decoder-Only LLM Architecture & Inference", "Modern autoregressive generation stacks (LLaMA, Mistral).", [
                ("Causal Masking & Pre-LayerNorm (RMSNorm)", "Preventing lookahead leakage in autoregressive generation and RMSNorm stability.", "CODE", "python"),
                ("Autoregressive Generation & The Key-Value (KV) Cache", "Eliminating O(n^2) redundant computation during generation via KV-caching.", "CODE", "python"),
                ("Decoding Strategies: Temperature, Top-K, Top-P (Nucleus) & Repetition Penalty", "Controlling output diversity, stochastic truncation, and beam search.", "CODE", "python"),
            ]),
            ("LLM Pretraining & Parameter-Efficient Fine-Tuning (PEFT)", "Scaling from raw foundation checkpoints to task specialists.", [
                ("Pretraining Objectives: Causal Language Modeling & Scaling Laws", "Chinchilla compute-optimal scaling laws, token-to-parameter ratios.", "TEXT", "text"),
                ("Low-Rank Adaptation (LoRA) Theory & Implementation", "Decomposing weight updates into W = W0 + B*A where r << d, rank selection.", "CODE", "python"),
                ("Quantization: 4-bit NormalFloat & QLoRA", "BitsAndBytes integration, double quantization, paged optimizers, and VRAM reduction.", "CODE", "python"),
            ]),
            ("Alignment: RLHF, DPO & LLM Evaluation", "Aligning model completions with human intent and safety standards.", [
                ("Instruction Tuning & Supervised Fine-Tuning (SFT)", "Formatting conversational datasets (chat templates), system prompts, Alpaca.", "CODE", "python"),
                ("Reinforcement Learning from Human Feedback (RLHF) with PPO", "Reward model training, KL-divergence policy penalty, and Proximal Policy Optimization.", "TEXT", "text"),
                ("Direct Preference Optimization (DPO)", "Eliminating explicit reward models by directly optimizing policy on pairwise preferences.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 46, "cat_key": "categoryD", "cat_name": "Artificial Intelligence and Machine Learning",
        "title": "Retrieval-Augmented Generation", "code": "AIM311", "branch": "AIML", "sem": 8, "diff": "Advanced", "mins": 640,
        "short_desc": "Vector databases, embedding models, semantic chunking, hybrid search, rerankers, and RAG evaluation.",
        "desc": "Ground Large Language Models on enterprise proprietary knowledge without retraining. Master document ingestion, chunking strategies, dense vector embeddings, vector databases (Milvus, Pinecone, Qdrant), HNSW index geometry, hybrid lexical/dense search, cross-encoder rerankers, and Ragas evaluation.",
        "skills": ["Vector Databases (Pinecone/Milvus)", "Embedding Models", "HNSW Indexing", "Hybrid Search (BM25 + Dense)", "Cross-Encoder Rerankers", "RAG Triad & Ragas"],
        "prereqs": ["Large Language Models", "Python Programming Fundamentals"],
        "objectives": ["Build end-to-end RAG pipelines connecting private documents to LLMs", "Chunk documents effectively using semantic splitting, recursive character parsing, and sliding windows", "Index dense vector representations using Hierarchical Navigable Small World (HNSW) graphs", "Evaluate RAG systems objectively on Faithfulness, Answer Relevance, and Context Recall"],
        "thumb": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("RAG Architecture & Document Parsing", "The grounding pipeline overcoming model hallucinations.", [
                ("The RAG Architectural Paradigm & Hallucination Mitigation", "Combining non-parametric external memory with parametric LLM intelligence.", "TEXT", "text"),
                ("Document Ingestion: PDF Parsing, OCR & Layout Analysis", "Extracting tables, structural headers, and metadata from documents.", "CODE", "python"),
                ("Chunking Strategies: Fixed, Recursive & Semantic Chunking", "Chunk sizes, token overlap windows, and embedding similarity boundaries.", "CODE", "python"),
            ]),
            ("Vector Embeddings & Vector Databases", "High-dimensional similarity search at scale.", [
                ("Dense Embedding Models & Distance Metrics", "Cosine similarity, dot product, Euclidean distance, and sentence-transformers.", "CODE", "python"),
                ("Approximate Nearest Neighbor (ANN) Indexing: HNSW & IVF", "Hierarchical Navigable Small World graphs, inverted file index, Voronoi cells.", "TEXT", "python"),
                ("Vector Database Integration: Collections, Metadata & Filtering", "CRUD operations, filtered vector search, and hybrid vector stores.", "CODE", "python"),
            ]),
            ("Advanced Retrieval & Re-Ranking Techniques", "Maximizing retrieval precision and contextual density.", [
                ("Hybrid Retrieval: Dense Embeddings + BM25 Sparse Search", "Reciprocal Rank Fusion (RRF) and combining keyword and semantic scores.", "CODE", "python"),
                ("Re-Ranking with Cross-Encoder Models", "Bi-encoders vs Cross-encoders, scoring top-k candidate chunks with Cohere/BGE.", "CODE", "python"),
                ("Context Compression & Query Transformations", "Hypothetical Document Embeddings (HyDE), sub-query decomposition, and routing.", "CODE", "python"),
            ]),
            ("RAG Orchestration, Agents & Evaluation", "Production deployment and quantitative quality benchmarking.", [
                ("Orchestration Frameworks: LangChain & LlamaIndex", "Chains, query engines, retrieval callbacks, and prompt templates.", "CODE", "python"),
                ("The RAG Triad: Context Relevance, Groundedness & Answer Relevance", "Automated benchmarking using synthetic test sets and LLM-as-a-judge.", "CODE", "python"),
                ("Ragas & TruLens Evaluation Frameworks", "Quantifying Faithfulness, Answer Semantic Similarity, and Context Recall.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 47, "cat_key": "categoryD", "cat_name": "Artificial Intelligence and Machine Learning",
        "title": "Prompt Engineering and AI Application Development", "code": "AIM312", "branch": "AIML", "sem": 7, "diff": "Intermediate", "mins": 560,
        "short_desc": "Chain-of-Thought, ReAct agents, structured JSON outputs, function calling, and LLM orchestration.",
        "desc": "Harness foundational language models to build production software applications. Master zero-shot/few-shot prompting, Chain-of-Thought (CoT), ReAct agentic loops, schema-enforced JSON function calling, guardrails, and building autonomous AI assistants.",
        "skills": ["Prompt Design", "Chain-of-Thought (CoT)", "ReAct Framework", "Tool / Function Calling", "Structured Outputs (Zod/Pydantic)", "Guardrails"],
        "prereqs": ["Python Programming Fundamentals"],
        "objectives": ["Design robust system prompts leveraging few-shot exemplars and persona framing", "Steer LLM reasoning paths using Chain-of-Thought and Least-to-Most decomposition", "Implement autonomous ReAct reasoning-action loops with live external tools", "Enforce strict schema validation on model outputs using Pydantic and JSON mode"],
        "thumb": "https://images.unsplash.com/photo-1516116211227-bbc0c25a07c3?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Prompt Engineering Principles & Patterns", "Controlling stochastic model completions deterministically.", [
                ("Zero-Shot, Few-Shot & In-Context Learning", "Demonstration formatting, label balance, and reducing task ambiguity.", "CODE", "python"),
                ("Role Prompting, Delimiters & Context Framing", "Markdown delimiters (###), system prompt engineering, and persona framing.", "CODE", "python"),
                ("Negative Prompting & Hallucination Constraints", "Instructing bounds: 'Answer only using provided context or state I do not know'.", "CODE", "python"),
            ]),
            ("Advanced Cognitive Reasoning Strategies", "Unlocking multi-step symbolic problem solving in LLMs.", [
                ("Chain-of-Thought (CoT) Prompting", "'Let's think step by step', mathematical reasoning, and error isolation.", "CODE", "python"),
                ("Tree of Thoughts (ToT) & Self-Consistency", "Generating multiple reasoning paths, majority voting, and tree search evaluation.", "CODE", "python"),
                ("Directional Stimulus & Least-to-Most Decomposition", "Breaking complex multi-part queries into sequential solvable sub-problems.", "CODE", "python"),
            ]),
            ("Structured Outputs & Function Calling", "Integrating LLMs reliably into backend software APIs.", [
                ("Function Calling & Tool Use Specifications", "OpenAI / Anthropic tool schema declarations, parameter validation.", "CODE", "python"),
                ("Structured JSON Output with Pydantic / Zod", "Enforcing strict JSON schema conformance, type coercion, and auto-retry validation.", "CODE", "python"),
                ("Parsing & Error Correction Loops", "Handling malformed JSON, markdown fence extraction, and feedback re-prompting.", "CODE", "python"),
            ]),
            ("Autonomous Agents & Safety Guardrails", "Building resilient multi-step AI agents and defensive barriers.", [
                ("The ReAct (Reason + Act) Agent Framework", "Thought, Action, Action Input, Observation iterative control loop.", "CODE", "python"),
                ("Memory Architectures: Buffer, Summary & Vector Memory", "Maintaining conversation history within finite context windows.", "CODE", "python"),
                ("Input/Output Guardrails & Prompt Injection Defense", "Jailbreak prevention, indirect prompt injection defense, and content moderation.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 48, "cat_key": "categoryD", "cat_name": "Artificial Intelligence and Machine Learning",
        "title": "Reinforcement Learning Fundamentals", "code": "AIM313", "branch": "AIML", "sem": 8, "diff": "Advanced", "mins": 680,
        "short_desc": "Markov Decision Processes (MDP), Bellman equations, Q-Learning, Deep Q-Networks (DQN), and Policy Gradients.",
        "desc": "Goal-directed learning from environmental interactions and rewards. Master Markov Decision Processes (MDPs), Bellman optimality equations, value iteration, policy iteration, temporal difference learning (Q-Learning, SARSA), Deep Q-Networks (DQN), and policy gradient methods (REINFORCE, PPO).",
        "skills": ["Markov Decision Processes (MDP)", "Bellman Optimality Equations", "Q-Learning & SARSA", "Deep Q-Networks (DQN)", "Policy Gradients (REINFORCE)", "Proximal Policy Optimization (PPO)"],
        "prereqs": ["Deep Learning Fundamentals", "Probability and Statistics"],
        "objectives": ["Formulate sequential decision-making tasks as formal Markov Decision Processes", "Solve finite MDPs using dynamic programming: Policy Iteration and Value Iteration", "Implement model-free temporal difference control using Q-Learning and SARSA", "Train Deep Q-Networks with Experience Replay buffers and Target Networks"],
        "thumb": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Markov Decision Processes & Dynamic Programming", "Mathematical formalism of sequential decision making.", [
                ("The Agent-Environment Interface & MDP Formalism", "States S, Actions A, Transition Probabilities P, Rewards R, Discount factor gamma.", "TEXT", "text"),
                ("Bellman Expectation & Optimality Equations", "State-value V(s) and action-value Q(s,a) recursive formulations.", "TEXT", "text"),
                ("Dynamic Programming: Value Iteration & Policy Iteration", "Policy evaluation, policy improvement, and contraction mapping convergence.", "CODE", "python"),
            ]),
            ("Model-Free Prediction & Control", "Learning optimal policies directly from environmental experience.", [
                ("Monte Carlo Methods for Episodic Tasks", "First-visit vs every-visit MC, exploring starts, and epsilon-greedy policies.", "CODE", "python"),
                ("Temporal Difference Learning: TD(0)", "Bootstrapping from future estimates, TD error delta = R + gamma V(s') - V(s).", "CODE", "python"),
                ("SARSA (On-Policy) vs Q-Learning (Off-Policy)", "Updating Q(s,a) with actual next action vs max over next actions.", "CODE", "python"),
            ]),
            ("Deep Q-Learning & Value Function Approximation", "Scaling reinforcement learning to continuous high-dimensional state spaces.", [
                ("Deep Q-Networks (DQN) Architecture", "Function approximation Q(s,a; theta) using deep neural networks.", "CODE", "python"),
                ("Experience Replay & Breaking Temporal Correlations", "Replay buffer uniform sampling, stabilizing training batch distributions.", "CODE", "python"),
                ("Target Networks & Double DQN", "Decoupling action selection from action evaluation to eliminate overestimation bias.", "CODE", "python"),
            ]),
            ("Policy Gradient Methods & Actor-Critic", "Optimizing parameterized policies directly in continuous action spaces.", [
                ("The Policy Gradient Theorem & REINFORCE Algorithm", "Likelihood ratio trick, trajectory returns, and high variance baselines.", "CODE", "python"),
                ("Actor-Critic Frameworks (A2C / A3C)", "Advantage function A(s,a) = Q(s,a) - V(s), Actor policy update, Critic baseline.", "CODE", "python"),
                ("Proximal Policy Optimization (PPO)", "Clipped surrogate objective function, trust region limits, and stable robotics/LLM tuning.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 49, "cat_key": "categoryD", "cat_name": "Artificial Intelligence and Machine Learning",
        "title": "MLOps Fundamentals", "code": "AIM314", "branch": "AIML", "sem": 8, "diff": "Advanced", "mins": 620,
        "short_desc": "Machine Learning Operations: MLflow experiment tracking, DVC, feature stores, model serving, and CI/CD.",
        "desc": "Bridge the gap between machine learning models and reliable production software. Master experiment tracking with MLflow, data and model versioning with DVC, automated training pipelines (Kubeflow/Airflow), low-latency model serving with FastAPI/Triton, and data drift monitoring.",
        "skills": ["MLflow Tracking", "DVC (Data Version Control)", "Model Registries", "Model Serving (FastAPI)", "Data & Concept Drift", "CI/CD for ML"],
        "prereqs": ["Supervised Machine Learning", "Docker Fundamentals"],
        "objectives": ["Track hyperparameters, metrics, and model artifacts systematically using MLflow", "Version multi-gigabyte training datasets and models using DVC connected to S3", "Deploy low-latency machine learning inference microservices with FastAPI and ONNX", "Detect statistical data drift and concept drift in production pipelines using Evidently AI"],
        "thumb": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("MLOps Principles & Experiment Tracking", "Standardizing the machine learning operational lifecycle.", [
                ("The MLOps Maturity Model & Technical Debt in ML", "Reproducibility crises, hidden technical debt, and pipeline glue code.", "TEXT", "text"),
                ("Experiment Tracking with MLflow", "Logging parameters, metrics, run tags, confusion matrices, and artifacts.", "CODE", "python"),
                ("The Model Registry & Promotion Stages", "Staging, Production, Archival, model versioning, and governance approval gates.", "CODE", "python"),
            ]),
            ("Data Versioning & Automated Pipelines", "Treating data and pipelines as version-controlled software assets.", [
                ("Data Version Control (DVC) Architecture", "dvc.yaml pipelines, content-addressable storage on S3, and Git metadata sync.", "CODE", "bash"),
                ("Feature Stores: Feast Architecture", "Online low-latency feature stores (Redis) vs offline batch stores (Parquet/Snowflake).", "CODE", "python"),
                ("Workflow Orchestration with Apache Airflow / Prefect", "DAG construction, task dependencies, retries, and scheduled model retraining.", "CODE", "python"),
            ]),
            ("Model Packaging, Serving & Optimization", "Exposing models as high-throughput, low-latency microservices.", [
                ("Model Serving with FastAPI & Docker", "Pydantic request payloads, async batching, containerization, and health probes.", "CODE", "python"),
                ("Model Optimization: ONNX & TensorRT", "Exporting PyTorch models to ONNX, operator fusion, FP16/INT8 quantization.", "CODE", "python"),
                ("High-Throughput Inference Engines (vLLM / Triton)", "Triton Inference Server dynamic batching and vLLM PagedAttention serving.", "CODE", "bash"),
            ]),
            ("Continuous Monitoring & Drift Detection", "Maintaining predictive fidelity in changing production environments.", [
                ("Data Drift vs Concept Drift", "Covariate shift p(x) vs concept shift p(y|x), and ground truth latency delays.", "TEXT", "text"),
                ("Statistical Drift Tests: KS-Test & Population Stability Index (PSI)", "Two-sample Kolmogorov-Smirnov test, Wasserstein distance, and PSI thresholds.", "CODE", "python"),
                ("Automated Retraining Triggers & Evidently AI", "Setting drift alert thresholds, generating monitoring dashboards, CI/CD retraining.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 50, "cat_key": "categoryD", "cat_name": "Artificial Intelligence and Machine Learning",
        "title": "AI Model Evaluation and Responsible AI", "code": "AIM315", "branch": "AIML", "sem": 8, "diff": "Intermediate", "mins": 580,
        "short_desc": "Model interpretability (SHAP, LIME), algorithmic fairness, bias mitigation, privacy, and safety regulations.",
        "desc": "Ensure artificial intelligence systems are fair, explainable, transparent, and compliant. Master post-hoc explainability (SHAP Shapley values, LIME local approximations), algorithmic fairness metrics (Demographic Parity, Equalized Odds), differential privacy, and AI governance frameworks.",
        "skills": ["SHAP (Shapley Additive exPlanations)", "LIME", "Algorithmic Fairness", "Equalized Odds", "Differential Privacy", "AI Ethics & EU AI Act"],
        "prereqs": ["Machine Learning Fundamentals"],
        "objectives": ["Compute game-theoretic feature attributions using SHAP (Shapley Additive exPlanations)", "Explain black-box model predictions locally using LIME surrogate models", "Audit machine learning models for demographic disparities and historical biases", "Apply differential privacy noise mechanisms to protect sensitive training records"],
        "thumb": "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Model Explainability & Feature Attribution", "Opening the black box of complex predictive models.", [
                ("Global vs Local Interpretability & Intrinsic vs Post-Hoc", "Linear coefficients, tree feature importance, and explainability trade-offs.", "TEXT", "text"),
                ("SHAP (Shapley Additive exPlanations)", "Cooperative game theory Shapley values, efficiency, symmetry, and TreeSHAP.", "CODE", "python"),
                ("LIME (Local Interpretable Model-agnostic Explanations)", "Local perturbation sampling, linear surrogate fitting, and instance explanations.", "CODE", "python"),
            ]),
            ("Algorithmic Fairness & Bias Metrics", "Measuring and mitigating demographic disparities in predictive algorithms.", [
                ("Sources of Machine Learning Bias", "Historical bias, representation bias, measurement bias, and feedback loops.", "TEXT", "text"),
                ("Group Fairness Metrics: Demographic Parity & Disparate Impact", "Four-fifths rule, selection rate ratios across protected demographic groups.", "CODE", "python"),
                ("Individual Fairness & Equalized Odds", "Equal Opportunity (True Positive Rate equality) and predictive parity trade-offs.", "CODE", "python"),
            ]),
            ("Bias Mitigation Strategies", "Intervening across data, training, and post-processing stages.", [
                ("Pre-Processing Mitigations: Reweighting & SMOTE", "Sample reweighting, optimized preprocessing, and demographic rebalancing.", "CODE", "python"),
                ("In-Processing Mitigations: Adversarial Debiasing", "Multi-task objective minimizing target error while penalizing protected attribute prediction.", "CODE", "python"),
                ("Post-Processing Mitigations: Threshold Optimizer", "Calibrating decision thresholds per demographic group to satisfy Equalized Odds.", "CODE", "python"),
            ]),
            ("Privacy, Security & AI Governance Frameworks", "Protecting individuals and complying with international regulatory mandates.", [
                ("Differential Privacy & The Laplace Mechanism", "Epsilon-delta privacy definitions, adding calibrated noise to query results.", "CODE", "python"),
                ("Model Inversion & Membership Inference Attacks", "Extracting training data from model weights and prediction probabilities.", "TEXT", "text"),
                ("Responsible AI Governance: EU AI Act & NIST AI RMF", "Risk categories (unacceptable, high, minimal), auditability, and safety boards.", "TEXT", "text"),
            ]),
        ]
    },
]

COURSES_E = [
    {
        "num": 51, "cat_key": "categoryE", "cat_name": "Data Science and Analytics",
        "title": "Mathematics for Data Science", "code": "DSA401", "branch": "AIML", "sem": 3, "diff": "Intermediate", "mins": 580,
        "short_desc": "Linear algebra, matrix factorizations (SVD), multivariate calculus, Jacobians, and convex optimization.",
        "desc": "The mathematical foundation required for modern data science. Master vector spaces, matrix rank, determinants, eigenvalue decomposition, Singular Value Decomposition (SVD), partial derivatives, gradients, Hessian matrices, and constrained Lagrange optimization.",
        "skills": ["Linear Algebra", "Matrix Factorization (SVD)", "Multivariate Calculus", "Jacobian & Hessian", "Gradient Descent Math", "Lagrange Multipliers"],
        "prereqs": ["Engineering Mathematics"],
        "objectives": ["Compute eigenvalues, eigenvectors, and execute Singular Value Decomposition (SVD)", "Calculate multidimensional gradients, Jacobians, and Hessian curvature matrices", "Solve constrained optimization problems using Lagrange multipliers and KKT conditions", "Apply linear algebraic transformations to project high-dimensional feature spaces"],
        "thumb": "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Vector Spaces & Matrix Transformations", "Linear mappings, bases, and dimensional rank.", [
                ("Vector Spaces, Subspaces & Linear Independence", "Span, basis vectors, dimension, null space, column space, and rank-nullity theorem.", "TEXT", "text"),
                ("Matrix Operations, Determinants & Inverses", "Matrix multiplication properties, Gauss-Jordan elimination, and determinant volume scaling.", "CODE", "python"),
                ("Orthogonality & Gram-Schmidt Orthogonalization", "Dot products, vector projections, orthogonal complements, and QR decomposition.", "CODE", "python"),
            ]),
            ("Eigenvalues & Matrix Factorizations", "Spectral decomposition and data compression foundations.", [
                ("Eigenvalues & Eigenvectors: Det(A - lambda I) = 0", "Characteristic polynomial, trace/determinant properties, and geometric multiplicity.", "CODE", "python"),
                ("Spectral Theorem & Symmetric Matrices", "Orthogonal diagonalization A = Q Lambda Q^T and positive definiteness.", "CODE", "python"),
                ("Singular Value Decomposition (SVD) Math", "Left/right singular vectors, singular values, low-rank approximations, and pseudo-inverse.", "CODE", "python"),
            ]),
            ("Multivariate Calculus & Vector Derivatives", "Differential calculus for multidimensional loss functions.", [
                ("Partial Derivatives & Directional Gradients", "Tangent planes, gradient vector del f, and steepest ascent direction.", "CODE", "python"),
                ("The Jacobian Matrix & Vector-Valued Functions", "First-order partial derivatives of vector transformations and change of variables.", "CODE", "python"),
                ("The Hessian Matrix & Second-Derivative Tests", "Curvature, quadratic forms, positive definite Hessians, and local minima tests.", "CODE", "python"),
            ]),
            ("Continuous Optimization & Duality", "Formulating and solving mathematical optimization programs.", [
                ("Convex Sets, Convex Functions & Jensen's Inequality", "Epigraphs, supporting hyperplanes, and global optimality of local minima.", "TEXT", "text"),
                ("Unconstrained Optimization & Gradient Methods", "First-order necessary conditions, line search, and gradient descent convergence bounds.", "CODE", "python"),
                ("Constrained Optimization: Lagrange Multipliers & KKT", "Equality constraints, inequality constraints, primal/dual problems, and KKT conditions.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 52, "cat_key": "categoryE", "cat_name": "Data Science and Analytics",
        "title": "Probability and Statistics", "code": "DSA402", "branch": "Common", "sem": 3, "diff": "Intermediate", "mins": 600,
        "short_desc": "Probability distributions, Central Limit Theorem, hypothesis testing, p-values, and Bayesian inference.",
        "desc": "Rigorous probability theory and statistical inference for data-driven engineering. Master random variables, discrete and continuous distributions (Gaussian, Binomial, Poisson), Central Limit Theorem, confidence intervals, hypothesis testing (t-tests, ANOVA), and Bayesian parameter estimation.",
        "skills": ["Probability Distributions", "Central Limit Theorem", "Hypothesis Testing (t-tests)", "p-values & Confidence Intervals", "ANOVA", "Bayesian Inference"],
        "prereqs": ["Engineering Mathematics"],
        "objectives": ["Model stochastic real-world events using discrete and continuous probability distributions", "Apply the Central Limit Theorem to compute sample means and confidence intervals", "Formulate null/alternative hypotheses and interpret p-values and effect sizes correctly", "Conduct one-way and two-way ANOVA tests to compare multi-group variances"],
        "thumb": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Probability Foundations & Axiomatic Rules", "Sample spaces, conditional probability, and independence.", [
                ("Probability Axioms, Sample Spaces & Combinatorics", "Kolmogorov axioms, union bounds, permutations, combinations.", "TEXT", "text"),
                ("Conditional Probability & Bayes' Theorem", "Law of Total Probability, prior, likelihood, evidence, and posterior distributions.", "CODE", "python"),
                ("Random Variables: PMFs, PDFs & CDFs", "Expectation E[X], Variance Var(X), covariance, and correlation coefficient rho.", "CODE", "python"),
            ]),
            ("Standard Probability Distributions", "Parametric models of discrete counts and continuous measurements.", [
                ("Discrete Distributions: Bernoulli, Binomial & Poisson", "Success trials, Poisson limit of binomial, and arrival rate modeling.", "CODE", "python"),
                ("Continuous Distributions: Uniform, Exponential & Normal", "Gaussian probability density function, 68-95-99.7 empirical rule, z-scores.", "CODE", "python"),
                ("Multivariate Normal Distribution & Covariance Ellipses", "Covariance matrix Sigma, joint densities, and marginal/conditional Gaussians.", "CODE", "python"),
            ]),
            ("Sampling Distributions & Estimation Theory", "Extrapolating population parameters from empirical samples.", [
                ("The Law of Large Numbers & Central Limit Theorem (CLT)", "Convergence in probability, sample mean distribution, standard error of the mean.", "CODE", "python"),
                ("Point Estimation: Maximum Likelihood (MLE) vs MAP", "Likelihood function, log-likelihood, derivative maximization, and prior shrinkage.", "CODE", "python"),
                ("Confidence Intervals & Student's t-Distribution", "Heavy-tailed distributions for small sample sizes, 95% CI margin of error.", "CODE", "python"),
            ]),
            ("Hypothesis Testing & Statistical Inference", "Making rigorous scientific decisions under uncertainty.", [
                ("Null Hypothesis Significance Testing (NHST) Framework", "Null (H0) vs Alternative (H1), Type I (alpha) and Type II (beta) errors, statistical power.", "TEXT", "text"),
                ("Parametric Tests: One-Sample, Two-Sample & Paired t-Tests", "Student's t-statistic, degrees of freedom, two-tailed p-values.", "CODE", "python"),
                ("ANOVA (Analysis of Variance) & Chi-Square Tests", "F-statistic, between-group vs within-group variance, Chi-Square contingency tables.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 53, "cat_key": "categoryE", "cat_name": "Data Science and Analytics",
        "title": "Data Analysis with Python", "code": "DSA403", "branch": "IT", "sem": 4, "diff": "Beginner", "mins": 520,
        "short_desc": "Data cleaning, wrangling, grouping, statistical summaries, missing value imputation, and pipeline exports.",
        "desc": "Hands-on data manipulation and analytical programming using Python. Clean messy raw datasets, detect outliers, perform robust missing value imputation, group and aggregate multi-dimensional data, execute string and datetime parsing, and generate analytical summary reports.",
        "skills": ["Data Wrangling", "Missing Data Imputation", "Outlier Detection (IQR)", "Data Grouping", "Time Series Wrangling", "Summary Statistics"],
        "prereqs": ["Python Programming Fundamentals"],
        "objectives": ["Identify, clean, and impute missing or corrupted data across heterogeneous tables", "Detect anomalous outliers using z-scores and Interquartile Range (IQR) rules", "Perform complex group-wise aggregations and transformations on tabular data", "Parse, resample, and analyze temporal time-series datasets in Python"],
        "thumb": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Data Ingestion & Initial Inspection", "Loading and auditing raw datasets.", [
                ("Reading CSV, Excel, JSON & Parquet Formats", "Memory-efficient chunked loading, delimiter sniffing, and schema inference.", "CODE", "python"),
                ("Dataset Inspection: info(), describe(), dtypes & Shapes", "Memory usage profiles, identifying data type mismatches, and unique counts.", "CODE", "python"),
                ("Data Quality Auditing & Duplicate Detection", "Identifying exact and fuzzy duplicate records, dropping redundancies safely.", "CODE", "python"),
            ]),
            ("Data Cleaning & Missing Value Handling", "Transforming noisy raw data into pristine analytical tables.", [
                ("Missing Data Mechanics: MCAR, MAR & MNAR", "Detecting nulls (isna/isnull), deletion strategies vs imputation trade-offs.", "TEXT", "text"),
                ("Imputation Techniques: Mean, Median, Mode & KNN", "Simple univariate imputation vs multi-variate KNN and iterative regression.", "CODE", "python"),
                ("Outlier Detection: Z-Score & Interquartile Range (IQR)", "Tukey's fences, 1.5*IQR bounds, winsorization, and clipping extremes.", "CODE", "python"),
            ]),
            ("Data Transformation & String/DateTime Parsing", "Restructuring and standardizing variables.", [
                ("Type Casting, Categorical Encodings & String Operations", "String stripping, regex extraction, lowercasing, and categorical types.", "CODE", "python"),
                ("DateTime Handling: Timestamps, Periods & Timezones", "pd.to_datetime, dt accessor, extracting year/month/day/hour, UTC conversion.", "CODE", "python"),
                ("Resampling & Rolling Window Calculations", "Frequency downsampling (daily to monthly), rolling means, and exponential smoothing.", "CODE", "python"),
            ]),
            ("Aggregation, Grouping & Analytical Reports", "Synthesizing business insights from granular records.", [
                ("Split-Apply-Combine Pattern with GroupBy", "Single and multi-column grouping, named aggregations (agg), transform vs filter.", "CODE", "python"),
                ("Pivot Tables & Cross-Tabulations", "pd.pivot_table, margins summary totals, pd.crosstab frequency tables.", "CODE", "python"),
                ("Exporting Analytical Deliverables & Report Pipelines", "Exporting sanitized tables to CSV, multi-sheet Excel, and SQLite databases.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 54, "cat_key": "categoryE", "cat_name": "Data Science and Analytics",
        "title": "NumPy and Pandas", "code": "DSA404", "branch": "IT", "sem": 4, "diff": "Intermediate", "mins": 560,
        "short_desc": "High-performance arrays: Vectorization, broadcasting, Pandas Series, DataFrames, multi-indexing, and merges.",
        "desc": "The dual computational pillars of Python scientific computing. Master NumPy ndarray memory layouts (C-contiguous vs Fortran), vectorization, broadcasting rules, ufuncs, and Pandas Series, DataFrames, boolean masking, hierarchical MultiIndex, and relational merges.",
        "skills": ["NumPy Arrays (ndarray)", "Vectorization & Broadcasting", "Pandas DataFrames", "Multi-Index Structures", "Merge / Join / Concat", "Memory Optimization"],
        "prereqs": ["Python Programming Fundamentals"],
        "objectives": ["Write high-performance vectorized operations eliminating Python for-loop bottlenecks", "Understand NumPy array broadcasting rules across differing dimensions", "Manipulate tabular data using Pandas loc/iloc, query, and boolean masking", "Join, concatenate, and merge multiple DataFrames across primary/foreign keys"],
        "thumb": "https://images.unsplash.com/photo-1516116211227-bbc0c25a07c3?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("NumPy ndarray Mechanics & Memory Layouts", "Homogeneous multidimensional arrays and stride tricks.", [
                ("The ndarray Object, Shapes & Dtypes", "Memory buffers, strides, itemsize, C-contiguous vs Fortran ordering.", "CODE", "python"),
                ("Array Creation: arange, linspace, zeros, eye & random", "Deterministic seeds, normal and uniform distributions, empty allocations.", "CODE", "python"),
                ("Array Slicing vs Views vs Deep Copies", "Understanding shared memory buffers in slices vs explicit .copy() calls.", "CODE", "python"),
            ]),
            ("Vectorization, Broadcasting & Universal Functions (ufuncs)", "Accelerating computations to C-speed execution.", [
                ("Vectorized Arithmetic & Eliminating Python Loops", "Element-wise operations, benchmark comparison vs native Python lists.", "CODE", "python"),
                ("The Broadcasting Rules & Alignment Math", "Trailing dimensions compatibility, prepending 1s, and dimension expansion.", "CODE", "python"),
                ("Universal Functions (ufuncs) & Reductions", "np.sum, np.mean, np.argmax, axis parameters, and accumulators.", "CODE", "python"),
            ]),
            ("Pandas Series & DataFrame Internals", "Labeled heterogeneous data structures.", [
                ("Pandas Series & Index Objects", "Series creation, index alignment, handling NaN values, and vectorized string methods.", "CODE", "python"),
                ("DataFrames: Indexing with loc, iloc & at", "Label-based vs position-based selection, boolean masking, and .query() syntax.", "CODE", "python"),
                ("Memory Optimization: Categorical Types & Downcasting", "Downcasting int64 to int16/int8, float64 to float32, and category memory savings.", "CODE", "python"),
            ]),
            ("Advanced Data Reshaping & Relational Operations", "Combining and pivoting multi-table data schemas.", [
                ("Concatenation & Stacking: pd.concat", "Appending along axis=0 vs axis=1, handling outer vs inner index joins.", "CODE", "python"),
                ("Relational Merges: pd.merge (Inner, Left, Right, Outer)", "Key matching, multi-column join keys, indicator flags, and validating 1:1 or 1:m.", "CODE", "python"),
                ("Hierarchical Multi-Indexing & Unstacking", "Creating MultiIndex levels, xs cross-section lookups, stack() and unstack().", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 55, "cat_key": "categoryE", "cat_name": "Data Science and Analytics",
        "title": "Data Visualization", "code": "DSA405", "branch": "IT", "sem": 5, "diff": "Intermediate", "mins": 500,
        "short_desc": "Visual storytelling: Matplotlib, Seaborn, Plotly interactive charts, chart grammar, and dashboard design.",
        "desc": "Communicate complex quantitative insights with clarity and visual excellence. Master the Grammar of Graphics, Matplotlib figure/axes object-oriented architecture, Seaborn statistical plots, interactive WebGL charts with Plotly, color theory, and accessibility.",
        "skills": ["Matplotlib (Object-Oriented)", "Seaborn Statistical Plots", "Plotly Interactive Charts", "Grammar of Graphics", "Color Theory & Contrast", "Chart Selection"],
        "prereqs": ["Data Analysis with Python"],
        "objectives": ["Construct publication-quality charts using Matplotlib's Figure and Axes API", "Visualize distributions, relationships, and categories using Seaborn", "Build interactive, zoomable WebGL data visualizations using Plotly", "Apply color theory, contrast ratios, and visual perception principles to avoid misleading charts"],
        "thumb": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Visual Perception & Grammar of Graphics", "The cognitive science of effective data visualization.", [
                ("Pre-Attentive Visual Attributes & Cleveland's Hierarchy", "Position, length, direction, angle, area, and color saturation decoding.", "TEXT", "text"),
                ("The Grammar of Graphics Concept", "Data, aesthetic mappings (aesthetics), geometric objects (geoms), facets, coordinates.", "TEXT", "text"),
                ("Color Theory: Sequential, Diverging & Categorical Palettes", "Color blindness accessibility (ColorBrewer, Viridis), avoiding rainbow colormaps.", "CODE", "python"),
            ]),
            ("Matplotlib: The Object-Oriented Interface", "Precise pixel-level control of publication graphics.", [
                ("Figure and Axes Architecture vs Pyplot State Machine", "fig, ax = plt.subplots(), managing multiple subplots and grid layouts.", "CODE", "python"),
                ("Core Chart Geometries: Lines, Bars, Scatters & Histograms", "Error bars, stacked bar charts, custom tick formatters, and annotations.", "CODE", "python"),
                ("Customizing Spines, Grids, Legends & Aesthetics", "Removing chart junk, setting minimalist spines, and high-DPI figure exports.", "CODE", "python"),
            ]),
            ("Seaborn: Statistical Visualizations", "High-level statistical modeling and distribution plots.", [
                ("Visualizing Univariate Distributions: histplot & kdeplot", "Kernel density estimation bandwidth, rug plots, and cumulative distribution curves.", "CODE", "python"),
                ("Categorical Plots: Boxplot, Violinplot & Stripplot", "Quartiles, whiskers, distribution density, and jittered raw data points.", "CODE", "python"),
                ("Relational Plots & FacetGrids: pairplot & jointplot", "Scatter plots with marginal distributions, bivariate regressions, and multi-panel facets.", "CODE", "python"),
            ]),
            ("Interactive Visualizations with Plotly", "Engaging web-ready responsive graphics.", [
                ("Plotly Express: Interactive Scatter, Bar & Sunburst Charts", "Hover tooltips, lasso selection, panning, zooming, and animation sliders.", "CODE", "python"),
                ("Plotly Graph Objects & Multi-Axis Financial Charts", "Candlestick charts, secondary y-axes, shapes, and custom hover templates.", "CODE", "python"),
                ("Exporting Interactive HTML & Embedding in Dashboards", "Self-contained HTML reports, JSON serializations, and responsive container resizing.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 56, "cat_key": "categoryE", "cat_name": "Data Science and Analytics",
        "title": "Data Science Fundamentals", "code": "DSA406", "branch": "AIML", "sem": 4, "diff": "Intermediate", "mins": 600,
        "short_desc": "CRISP-DM methodology, end-to-end data science lifecycle, business problem formulation, and pipelines.",
        "desc": "The complete multidisciplinary workflow of data science in enterprise organizations. Master the CRISP-DM methodology, translating business objectives into measurable predictive hypotheses, end-to-end pipeline orchestration, and model storytelling.",
        "skills": ["CRISP-DM Lifecycle", "Business Problem Formulation", "Pipeline Automation", "Model Auditing", "Data Science Storytelling"],
        "prereqs": ["Data Analysis with Python", "Machine Learning Fundamentals"],
        "objectives": ["Structure data science initiatives following the 6 phases of the CRISP-DM methodology", "Formulate clear business questions into quantifiable predictive modeling tasks", "Build automated end-to-end data ingestion, modeling, and evaluation pipelines", "Communicate technical statistical findings clearly to non-technical stakeholders"],
        "thumb": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("The Data Science Discipline & CRISP-DM Process", "Systematic methodology for enterprise analytics projects.", [
                ("The CRISP-DM Lifecycle: 6 Iterative Phases", "Business Understanding, Data Understanding, Preparation, Modeling, Evaluation, Deployment.", "TEXT", "text"),
                ("Framing Business Questions as ML Formulations", "Churn prediction, fraud scoring, recommendation, and lifetime value estimation.", "TEXT", "text"),
                ("Defining Business Metrics vs Technical Metrics", "Translating accuracy/F1 into revenue lift, cost savings, and risk avoidance.", "CODE", "python"),
            ]),
            ("Data Understanding & Initial Auditing", "Deep inspection before model training.", [
                ("Data Profiling & Schema Auditing", "Column cardinality, data drift indicators, and integrity constraint verification.", "CODE", "python"),
                ("Identifying Confounding Variables & Selection Bias", "Survivorship bias, Berkson's paradox, and historical collection discrepancies.", "TEXT", "text"),
                ("Data Quality Reports & Automated Baseline Profiling", "Generating baseline quality scorecards using ydata-profiling.", "CODE", "python"),
            ]),
            ("Data Preparation & Pipeline Orchestration", "Reproducible data pipelines for modeling.", [
                ("Modular Data Cleaning Pipelines with Scikit-Learn", "Custom transformers (BaseEstimator, TransformerMixin) and ColumnTransformer.", "CODE", "python"),
                ("Automated Feature Transformation Pipelines", "Scaling numerical features, one-hot encoding categories, and pipeline caching.", "CODE", "python"),
                ("Pipeline Persistence with Joblib", "Serializing trained pipelines, verifying reproducibility, and schema testing.", "CODE", "python"),
            ]),
            ("Evaluation, Governance & Executive Storytelling", "Closing the loop from prediction to decision.", [
                ("A/B Testing Foundations for Model Deployment", "Randomized controlled trials, sample size estimation, and minimum detectable effect.", "CODE", "python"),
                ("Model Governance, Documentation & Model Cards", "Documenting intended use cases, performance limitations, and training provenance.", "TEXT", "text"),
                ("Executive Storytelling & Data-Driven Presentations", "Structuring narrative arcs: Situation, Complication, Resolution, and Call to Action.", "TEXT", "text"),
            ]),
        ]
    },
    {
        "num": 57, "cat_key": "categoryE", "cat_name": "Data Science and Analytics",
        "title": "Exploratory Data Analysis", "code": "DSA407", "branch": "IT", "sem": 5, "diff": "Intermediate", "mins": 540,
        "short_desc": "Systematic EDA: Univariate, bivariate, multivariate patterns, correlation matrices, skewness, and transformations.",
        "desc": "Uncover the underlying signals and structural anomalies in datasets. Master John Tukey's exploratory data analysis framework, univariate distribution analysis, skewness, power transformations (Box-Cox, Yeo-Johnson), bivariate correlation heatmaps, and Simpson's Paradox.",
        "skills": ["Univariate EDA", "Bivariate & Multivariate EDA", "Correlation Heatmaps", "Box-Cox Transformations", "Simpson's Paradox", "Data Skewness"],
        "prereqs": ["Data Analysis with Python", "Data Visualization"],
        "objectives": ["Conduct exhaustive univariate inspections of continuous and categorical feature spaces", "Analyze bivariate relationships, interaction terms, and correlation matrices", "Normalize skewed feature distributions using log and Box-Cox power transformations", "Identify and explain Simpson's Paradox in aggregated multi-group datasets"],
        "thumb": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Univariate Exploratory Analysis", "Analyzing single variables in isolation.", [
                ("Continuous Feature Distributions: Moments & Skewness", "Mean, variance, Pearson skewness, kurtosis, and tail thickness.", "CODE", "python"),
                ("Normality Testing: Shapiro-Wilk & Q-Q Plots", "Quantile-Quantile probability plots, visual normality assessment.", "CODE", "python"),
                ("Categorical Feature Profiling: Frequencies & Cardinality", "Frequency tables, Pareto distributions (80/20 rule), and rare label detection.", "CODE", "python"),
            ]),
            ("Bivariate Analysis & Correlation Metrics", "Exploring paired dependencies between variables.", [
                ("Continuous-to-Continuous: Pearson vs Spearman vs Kendall", "Linear correlation vs monotonic rank correlation, sensitivity to outliers.", "CODE", "python"),
                ("Categorical-to-Continuous: Group Distributions", "Overlaid KDE plots, boxplot comparisons, and ANOVA F-tests.", "CODE", "python"),
                ("Categorical-to-Categorical: Cramer's V & Contingency Tables", "Chi-square independence, normalized association strength with Cramer's V.", "CODE", "python"),
            ]),
            ("Multivariate Patterns & Anomalies", "Interactions across three or more variables.", [
                ("Correlation Heatmaps & Multicollinearity Detection", "Masked triangular correlation heatmaps and Variance Inflation Factor (VIF).", "CODE", "python"),
                ("Simpson's Paradox & Confounding Stratification", "Reversal of associations upon subgroup conditioning, real-world case studies.", "CODE", "python"),
                ("Pairwise Feature Interactions & Clustering Tendency", "Hopkins statistic, assessing clusterability before unsupervised training.", "CODE", "python"),
            ]),
            ("Distribution Transformations & Scaling", "Reshaping feature geometry to satisfy model assumptions.", [
                ("Log Transformations & Power Scaling", "np.log1p for right-skewed revenue/price data, stabilizing variance.", "CODE", "python"),
                ("Box-Cox & Yeo-Johnson Power Transformations", "Maximizing likelihood parameter lambda, handling negative numbers with Yeo-Johnson.", "CODE", "python"),
                ("Quantile Transformations & Uniform Mapping", "Mapping empirical distributions to uniform or standard Gaussian shapes.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 58, "cat_key": "categoryE", "cat_name": "Data Science and Analytics",
        "title": "Feature Engineering", "code": "DSA408", "branch": "AIML", "sem": 6, "diff": "Advanced", "mins": 620,
        "short_desc": "Target encoding, interaction terms, cyclical datetime features, PCA features, and automated feature selection.",
        "desc": "The art and science of boosting machine learning model performance through domain-specific feature representations. Master categorical target encoding, cyclical feature engineering (sine/cosine transforms), text TF-IDF, polynomial interactions, and filter/wrapper/embedded feature selection.",
        "skills": ["Target Encoding (Smoothing)", "Cyclical Time Encodings", "Polynomial Interactions", "Feature Selection (RFE)", "Variance Inflation Factor (VIF)", "Text TF-IDF"],
        "prereqs": ["Supervised Machine Learning", "Exploratory Data Analysis"],
        "objectives": ["Encode high-cardinality categorical variables using smoothed Out-of-Fold Target Encoding", "Transform periodic temporal features into continuous cyclical representations using trigonometric functions", "Generate polynomial interaction terms and domain ratios that capture non-linear relationships", "Select optimal feature subsets using Recursive Feature Elimination (RFE) and LASSO penalties"],
        "thumb": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Advanced Categorical Encoding", "Representing discrete categories without exploding dimensional space.", [
                ("One-Hot Encoding vs Ordinal Encoding Trade-Offs", "Dimensionality explosion, sparse matrices, and arbitrary ordering hazards.", "CODE", "python"),
                ("Out-of-Fold Target Encoding with M-Estimate Smoothing", "Bayesian smoothing, preventing target leakage using K-fold out-of-fold loops.", "CODE", "python"),
                ("Weight of Evidence (WoE) & Information Value (IV)", "Binary classification log-odds ratios, credit risk scoring conventions.", "CODE", "python"),
            ]),
            ("Numerical & Temporal Feature Transformations", "Extracting domain signals from continuous measurements.", [
                ("Binning & Discretization Strategies", "Equal-width vs equal-frequency (quantile) binning, decision tree binning.", "CODE", "python"),
                ("Cyclical Encoding: Sine & Cosine Transformations", "Preserving circular continuity for hours (23 to 0) and calendar months.", "CODE", "python"),
                ("Lag Features & Rolling Aggregate Windows for Time Series", "Shifting time series, calculating 7-day rolling means, volatility, momentum.", "CODE", "python"),
            ]),
            ("Interaction Features & Domain Synthesis", "Engineering cross-feature relationships.", [
                ("Polynomial Interactions & Cross Products", "Generating interaction terms (x1 * x2) and domain ratio metrics (debt-to-income).", "CODE", "python"),
                ("Group-Level Aggregation Features", "Computing user-level historical means, deviations from group centroids.", "CODE", "python"),
                ("Unsupervised Feature Extraction (PCA & Clustering Features)", "Using cluster distance as predictive features and PCA component projections.", "CODE", "python"),
            ]),
            ("Feature Selection & Dimensionality Pruning", "Removing redundant and noisy predictors to prevent overfitting.", [
                ("Filter Methods: Variance Threshold & Mutual Information", "Removing constant features, non-linear mutual information entropy scores.", "CODE", "python"),
                ("Wrapper Methods: Recursive Feature Elimination (RFE)", "Iteratively pruning least significant features using cross-validated RFE (RFECV).", "CODE", "python"),
                ("Embedded Methods: L1 Lasso & Tree Feature Importance", "Lasso sparsity selection, permutation importance vs MDI tree bias.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 59, "cat_key": "categoryE", "cat_name": "Data Science and Analytics",
        "title": "Big Data Fundamentals", "code": "DSA409", "branch": "CSE", "sem": 7, "diff": "Intermediate", "mins": 640,
        "short_desc": "Hadoop ecosystem (HDFS/MapReduce), Apache Spark, resilient distributed datasets (RDD), DataFrames, and PySpark.",
        "desc": "Scale analytical computations across distributed clusters. Master the 5 V's of Big Data, HDFS distributed storage, MapReduce paradigm, Apache Spark unified engine, Resilient Distributed Datasets (RDDs), Spark SQL DataFrames, catalyst query optimizer, and PySpark programming.",
        "skills": ["Hadoop & HDFS", "MapReduce Paradigm", "Apache Spark Engine", "PySpark DataFrames", "Catalyst Optimizer", "Distributed Shuffling"],
        "prereqs": ["Operating Systems", "Python Programming Fundamentals"],
        "objectives": ["Understand HDFS distributed block replication and NameNode/DataNode architecture", "Deconstruct distributed data processing under the MapReduce paradigm", "Write parallelized data transformation workflows using Apache Spark and PySpark DataFrames", "Optimize Spark execution plans by tuning partitioning, shuffling, and broadcast joins"],
        "thumb": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Big Data Characteristics & Distributed Storage", "The challenges of petabyte-scale data processing.", [
                ("The 5 V's of Big Data: Volume, Velocity, Variety, Veracity, Value", "Horizontal cluster scaling, commodity hardware, and shared-nothing architecture.", "TEXT", "text"),
                ("Hadoop Distributed File System (HDFS) Architecture", "NameNode metadata, DataNodes, 128MB block sizing, rack awareness, and 3x replication.", "TEXT", "text"),
                ("The Classic MapReduce Computation Model", "Map step, Shuffle and Sort phase, Reduce step, and fault-tolerant task re-execution.", "CODE", "python"),
            ]),
            ("Apache Spark Architecture & In-Memory Compute", "Next-generation distributed memory processing.", [
                ("Spark Driver, Cluster Manager & Worker Executors", "JVM memory heaps, task slots, and distributed execution DAGs.", "TEXT", "text"),
                ("Resilient Distributed Datasets (RDD) & Lineage Graphs", "Lazy evaluation, narrow vs wide transformations, and lineage fault recovery.", "CODE", "python"),
                ("Spark Transformations vs Actions", "map, filter, flatMap vs collect, count, take, saveAsTextFile.", "CODE", "python"),
            ]),
            ("PySpark DataFrames & Spark SQL", "High-level structured data processing.", [
                ("Spark DataFrames & Structured APIs", "Schema enforcement, column expressions, selecting, filtering, and grouping.", "CODE", "python"),
                ("Catalyst Query Optimizer & Tungsten Engine", "Logical optimization, physical planning, code generation, and off-heap memory.", "TEXT", "text"),
                ("Window Functions & Aggregations in PySpark", "Over partitions, cumulative metrics, and analytical calculations on clusters.", "CODE", "python"),
            ]),
            ("Distributed Performance Tuning & Data Formats", "Eliminating cluster bottlenecks and skew.", [
                ("Columnar Formats: Apache Parquet vs ORC", "Columnar storage, dictionary encoding, snappy compression, and predicate pushdown.", "CODE", "python"),
                ("Data Shuffling, Partitioning & Broadcast Joins", "Wide dependency bottlenecks, repartition vs coalesce, broadcast hash joins.", "CODE", "python"),
                ("Handling Data Skew in Distributed Joins", "Salting keys, adaptive query execution (AQE), and skew join optimization.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 60, "cat_key": "categoryE", "cat_name": "Data Science and Analytics",
        "title": "Business Intelligence and Analytics", "code": "DSA410", "branch": "IT", "sem": 6, "diff": "Intermediate", "mins": 560,
        "short_desc": "Data warehousing (Kimball), Star/Snowflake schemas, ETL pipelines, OLAP cubes, and executive KPI dashboards.",
        "desc": "Transform raw operational data into strategic corporate intelligence. Master Ralph Kimball's dimensional modeling, Star and Snowflake schemas, Slowly Changing Dimensions (SCD Type 1/2), OLAP cubes, ETL/ELT pipelines, and designing actionable executive KPI dashboards.",
        "skills": ["Dimensional Modeling (Kimball)", "Star & Snowflake Schemas", "Slowly Changing Dimensions (SCD)", "ETL / ELT Pipelines", "OLAP vs OLTP", "KPI Dashboard Design"],
        "prereqs": ["Database Management Systems", "SQL Fundamentals"],
        "objectives": ["Design dimensional data warehouse schemas using Fact and Dimension tables", "Model history tracking using Slowly Changing Dimensions (SCD Type 2)", "Differentiate transactional OLTP systems from analytical OLAP cubes and columnar warehouses", "Build executive KPI dashboards with actionable metrics, drill-downs, and filters"],
        "thumb": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Data Warehousing & Dimensional Modeling", "Architecting analytical repositories for business reporting.", [
                ("OLTP vs OLAP Architecture Comparison", "Normalized row stores vs denormalized columnar warehouses, query patterns.", "TEXT", "text"),
                ("Kimball Dimensional Modeling Methodology", "Fact tables (additive, semi-additive, non-additive) and Dimension tables.", "TEXT", "text"),
                ("Star Schema vs Snowflake Schema", "Denormalized star efficiency vs normalized snowflake hierarchies, surrogate keys.", "CODE", "sql"),
            ]),
            ("Advanced Dimensional Patterns & History", "Managing evolving corporate entity dimensions.", [
                ("Slowly Changing Dimensions (SCD Types 0, 1, 2, 3)", "Overwriting values (Type 1), row versioning with effective dates (Type 2).", "CODE", "sql"),
                ("Conformed Dimensions & Enterprise Bus Architecture", "Shared dimensions (Customer, Date) across multiple business process facts.", "TEXT", "text"),
                ("Role-Playing Dimensions & Junk Dimensions", "Date dimensions playing OrderDate, ShipDate, DeliveryDate; combining flags.", "CODE", "sql"),
            ]),
            ("ETL vs ELT Data Ingestion Pipelines", "Moving and transforming data into modern data warehouses.", [
                ("Traditional ETL vs Modern Cloud ELT", "Transforming before load vs loading raw into Snowflake/BigQuery and transforming with dbt.", "TEXT", "text"),
                ("Change Data Capture (CDC) & Incremental Ingestion", "Log-based CDC with Debezium, watermark timestamps, and UPSERT merges.", "CODE", "sql"),
                ("Data Quality Gates & Schema Evolution", "Pre-load assertion testing, Great Expectations, and handling added columns.", "CODE", "python"),
            ]),
            ("Executive Dashboards & KPI Architecture", "Visual decision-support systems for executive leadership.", [
                ("Defining Core Business KPIs & Unit Economics", "Customer Acquisition Cost (CAC), Lifetime Value (LTV), Churn, Net Promoter Score.", "TEXT", "text"),
                ("Dashboard Layout Principles & Information Hierarchy", "The inverted pyramid: high-level KPI cards, trend lines, granular tables.", "TEXT", "text"),
                ("Interactive Filtering, Drill-Downs & Cohort Retention", "Dimension slicers, date range pickers, cross-filtering, and cohort heatmaps.", "CODE", "sql"),
            ]),
        ]
    },
]

COURSES_F = [
    {
        "num": 61, "cat_key": "categoryF", "cat_name": "Cloud, DevOps, and Software Tools",
        "title": "Linux Fundamentals", "code": "CLD501", "branch": "Common", "sem": 2, "diff": "Beginner", "mins": 500,
        "short_desc": "Linux kernel, Bash command line, file permissions (chmod/chown), process management, and shell scripting.",
        "desc": "Master the world's primary server operating system. Navigate the Linux filesystem hierarchy (FHS), master Bash shell commands, file ownership and permissions, process inspection (ps, top, kill), standard streams (stdin, stdout, stderr), piping, and automation scripts.",
        "skills": ["Linux CLI", "Bash Shell Scripting", "File Permissions (chmod/chown)", "Process Signals (kill)", "Standard Streams & Pipes", "Systemd Services"],
        "prereqs": ["None - Open to all engineering students"],
        "objectives": ["Navigate and manage files in the Linux directory hierarchy using standard terminal commands", "Configure file access controls, octal permissions (chmod), and ownership (chown)", "Chain commands using pipes, filters (grep, awk, sed), and I/O redirection", "Write robust Bash shell automation scripts with variables, conditionals, and loops"],
        "thumb": "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Linux Architecture & Shell Navigation", "The Unix philosophy and command-line navigation.", [
                ("Linux Kernel, User Space & Filesystem Hierarchy (FHS)", "/etc, /var, /bin, /usr, /home, /proc virtual filesystem, and kernel interface.", "TEXT", "text"),
                ("Essential File Operations: ls, cd, cp, mv, rm, mkdir", "Absolute vs relative paths, recursive operations, globbing wildcards.", "CODE", "bash"),
                ("Inspecting File Contents: cat, less, head, tail -f", "Paging large log files, real-time log monitoring with tail -f, file types.", "CODE", "bash"),
            ]),
            ("File Permissions, Ownership & Users", "Securing access controls on shared multi-user systems.", [
                ("User & Group Architecture: /etc/passwd, /etc/shadow", "UID, GID, superuser root privilege, and sudo delegation.", "CODE", "bash"),
                ("Linux File Permissions: Read, Write, Execute (rwx)", "Symbolic notation (u+x) vs Octal notation (755, 644, 700), directory execution bits.", "CODE", "bash"),
                ("Ownership & Special Permissions: SUID, SGID & Sticky Bit", "chown, chgrp, /tmp directory sticky bit, and SUID security considerations.", "CODE", "bash"),
            ]),
            ("Text Processing, Pipes & Standard Streams", "Composing modular tools into powerful pipelines.", [
                ("Standard Streams & Redirection: stdin, stdout, stderr", "File descriptors (0, 1, 2), redirecting output (> and >>), 2>&1 merges.", "CODE", "bash"),
                ("Piping & Filter Utilities: grep, cut, sort, uniq, wc", "Chaining commands via Unix pipes, regex filtering with grep -E, deduplicating.", "CODE", "bash"),
                ("Stream Editing with Sed & Awk", "In-place text replacement with sed, column extraction and calculations with awk.", "CODE", "bash"),
            ]),
            ("Process Control & Shell Automation Scripting", "Managing background services and writing automation scripts.", [
                ("Process Management: ps, top, htop & Signals (SIGTERM, SIGKILL)", "PID, backgrounding jobs with &, kill -9, nice priorities.", "CODE", "bash"),
                ("Systemd Services & Journalctl Logs", "systemctl start/stop/enable/status, creating custom .service unit files.", "CODE", "bash"),
                ("Bash Scripting Foundations: Variables, Conditionals & Loops", "#!/bin/bash shebang, exit codes ($?), if-elif-else, for loops, functions.", "CODE", "bash"),
            ]),
        ]
    },
    {
        "num": 62, "cat_key": "categoryF", "cat_name": "Cloud, DevOps, and Software Tools",
        "title": "Git and GitHub", "code": "CLD502", "branch": "Common", "sem": 2, "diff": "Beginner", "mins": 480,
        "short_desc": "Distributed version control: Commits, branching, merging, rebasing, merge conflicts, and GitHub workflows.",
        "desc": "The indispensable version control tool for professional software teams. Master Git's content-addressable storage (blobs, trees, commits), staging areas, branching strategies, fast-forward vs three-way merges, interactive rebasing, merge conflict resolution, and GitHub pull requests.",
        "skills": ["Git CLI", "Branching & Merging", "Interactive Rebase", "Merge Conflict Resolution", "GitHub Pull Requests", "Git Internals (.git)"],
        "prereqs": ["None - Open to all engineering students"],
        "objectives": ["Understand Git internal architecture: Directed Acyclic Graphs (DAG) of commit snapshots", "Manage branch lifecycles, execute clean three-way merges, and resolve conflicts", "Reorganize commit history cleanly using interactive rebasing (git rebase -i)", "Collaborate on team codebases using GitHub forks, pull requests, and code reviews"],
        "thumb": "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Git Architecture & The Three Trees", "How Git models snapshots instead of file diffs.", [
                ("The Three Trees: Working Directory, Staging Area & Repository", "git add, git status, git diff, and the index staging cache.", "CODE", "bash"),
                ("Git Internals: Blobs, Trees, Commits & SHA-1 Hashes", "Exploring .git/objects, content-addressable hashes, and immutable snapshots.", "TEXT", "bash"),
                ("Commit Hygiene & Conventional Commit Messages", "Atomic commits, feat/fix/chore conventions, and writing descriptive commit bodies.", "CODE", "bash"),
            ]),
            ("Branching, Merging & Conflict Resolution", "Parallel development workflows without collisions.", [
                ("Branch Mechanics: Moving Pointers on the DAG", "git branch, git checkout vs git switch, HEAD pointer mechanics.", "CODE", "bash"),
                ("Fast-Forward Merges vs Three-Way Merge Commits", "Common ancestors, non-conflicting merge commits with git merge --no-ff.", "CODE", "bash"),
                ("Resolving Merge Conflicts Confidently", "Conflict markers (<<<<<<<, =======, >>>>>>>), 3-way visual diff tools.", "CODE", "bash"),
            ]),
            ("History Rewriting & Advanced Operations", "Polishing local commits before sharing with teams.", [
                ("Interactive Rebasing: git rebase -i", "Squashing fixup commits, reordering commits, and editing commit messages.", "CODE", "bash"),
                ("Undo Operations: git reset, git revert & git checkout", "Soft, mixed, and hard resets vs non-destructive git revert commits.", "CODE", "bash"),
                ("The Safety Net: git reflog & Stashing", "Recovering lost commits with reflog, temporary shelf with git stash.", "CODE", "bash"),
            ]),
            ("GitHub Collaboration & Team Workflows", "Open-source and enterprise collaborative engineering.", [
                ("Remote Repositories: git fetch, pull, push & Upstream", "Tracking branches, remote-tracking refs (origin/main), and push rules.", "CODE", "bash"),
                ("GitHub Pull Requests, Code Reviews & Branch Protections", "PR descriptions, reviewing diffs, requesting changes, and required CI checks.", "TEXT", "text"),
                ("Branching Models: GitFlow vs GitHub Flow vs Trunk-Based", "Feature branches, release tags, and continuous deployment workflows.", "TEXT", "text"),
            ]),
        ]
    },
    {
        "num": 63, "cat_key": "categoryF", "cat_name": "Cloud, DevOps, and Software Tools",
        "title": "Docker Fundamentals", "code": "CLD503", "branch": "CSE", "sem": 5, "diff": "Intermediate", "mins": 560,
        "short_desc": "Containerization: Docker engine, namespaces, cgroups, Dockerfile multi-stage builds, and Compose.",
        "desc": "Package and ship applications reliably anywhere. Learn Linux containerization primitives (Namespaces and Control Groups), Docker images, layer caching, writing production multi-stage Dockerfiles, managing persistent volumes, container networks, and multi-container Docker Compose.",
        "skills": ["Docker Containers", "Dockerfile Multi-Stage Builds", "Layer Caching", "Docker Volumes", "Docker Networking", "Docker Compose"],
        "prereqs": ["Linux Fundamentals"],
        "objectives": ["Understand Linux container isolation: Namespaces (PID, Net) and Control Groups (cgroups)", "Build secure, lightweight container images using multi-stage Dockerfiles", "Manage persistent storage and state using Docker Volumes and bind mounts", "Orchestrate multi-service microservice environments using Docker Compose"],
        "thumb": "https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Containerization Principles & Docker Engine", "Isolating processes without virtual machine hypervisor overhead.", [
                ("Containers vs Virtual Machines: Namespaces & Cgroups", "Shared OS kernel, process isolation, PID, Mount, Net namespaces, CPU/RAM limits.", "TEXT", "text"),
                ("Docker Engine Architecture: Client, Daemon & Containerd", "dockerd daemon, OCI runtime (runc), UNIX sockets, and image registries.", "TEXT", "text"),
                ("Container Lifecycle: run, stop, start, exec, rm, logs", "Foreground vs detached (-d) modes, port mapping (-p), interactive shells (-it).", "CODE", "bash"),
            ]),
            ("Building Images with Dockerfiles", "Defining immutable, reproducible software images.", [
                ("Dockerfile Instructions: FROM, WORKDIR, COPY, RUN, CMD, ENTRYPOINT", "CMD default arguments vs ENTRYPOINT executables, build contexts.", "CODE", "dockerfile"),
                ("Image Layers & Build Cache Optimization", "Union filesystem (OverlayFS), layer ordering for maximum cache reuse.", "CODE", "dockerfile"),
                ("Multi-Stage Dockerfiles for Production", "Separating build SDKs from runtime environments, trimming image size by 90%.", "CODE", "dockerfile"),
            ]),
            ("Storage & Networking in Docker", "State persistence and inter-container communication.", [
                ("Storage: Volumes vs Bind Mounts vs Tmpfs", "Ephemeral container layers, named volumes for database storage, bind mounts for dev.", "CODE", "bash"),
                ("Docker Networking Drivers: Bridge, Host & None", "Default bridge, user-defined bridge networks with embedded DNS discovery.", "CODE", "bash"),
                ("Non-Root Security & Container Hardening", "USER directive, eliminating root vulnerabilities, read-only root filesystems.", "CODE", "dockerfile"),
            ]),
            ("Multi-Container Applications with Docker Compose", "Declarative local multi-service orchestration.", [
                ("Docker Compose File Format & Services Architecture", "services, networks, volumes, depends_on order, environment variables.", "CODE", "yaml"),
                ("Connecting Web API to Database & Redis Cache", "Spinning up full full-stack environments with a single 'docker compose up -d'.", "CODE", "yaml"),
                ("Healthchecks & Automated Container Restarts", "restart: unless-stopped, HEALTHCHECK instructions, and graceful shutdowns.", "CODE", "yaml"),
            ]),
        ]
    },
    {
        "num": 64, "cat_key": "categoryF", "cat_name": "Cloud, DevOps, and Software Tools",
        "title": "Kubernetes Fundamentals", "code": "CLD504", "branch": "CSE", "sem": 6, "diff": "Advanced", "mins": 660,
        "short_desc": "Container orchestration: Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, and Autoscaling (HPA).",
        "desc": "Automate deployment, scaling, and operations of application containers across clusters. Master Kubernetes control plane architecture (etcd, API server, scheduler), worker nodes (kubelet, kube-proxy), Pods, Deployments, ClusterIP/NodePort Services, Ingress, and Horizontal Pod Autoscaling.",
        "skills": ["Kubernetes Architecture", "Pods & Deployments", "Services (ClusterIP/LoadBalancer)", "Ingress Controllers", "ConfigMaps & Secrets", "Horizontal Pod Autoscaler (HPA)"],
        "prereqs": ["Docker Fundamentals", "Linux Fundamentals"],
        "objectives": ["Understand the Kubernetes control plane: etcd consensus, API server, and kubelet loops", "Deploy scalable, zero-downtime rolling update workloads using Deployments", "Expose microservices internally and externally using Services and Ingress routers", "Configure automatic horizontal pod scaling (HPA) based on CPU and memory thresholds"],
        "thumb": "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Kubernetes Architecture & Cluster Mechanics", "Declarative desired-state orchestration engine.", [
                ("Control Plane vs Worker Nodes Architecture", "kube-apiserver, etcd key-value store, kube-scheduler, kube-controller-manager.", "TEXT", "text"),
                ("Worker Components: Kubelet, Kube-Proxy & Container Runtime", "Pod lifecycle management, iptables/IPVS routing, and CRI runtime interface.", "TEXT", "text"),
                ("Kubectl CLI & Declarative YAML Manifests", "Imperative commands vs declarative 'kubectl apply -f', apiVersion, kind, spec.", "CODE", "yaml"),
            ]),
            ("Core Workload Resources: Pods & Deployments", "Deploying and managing replicated containers.", [
                ("Pods: The Atomic Unit of Kubernetes Scheduling", "Multi-container pods (sidecar pattern), shared localhost, and volume mounts.", "CODE", "yaml"),
                ("Deployments & ReplicaSets: Rolling Updates & Rollbacks", "spec.replicas, maxSurge, maxUnavailable, zero-downtime rolling deploys, undo.", "CODE", "yaml"),
                ("Liveness, Readiness & Startup Probes", "Preventing traffic to initializing containers and auto-restarting deadlocked pods.", "CODE", "yaml"),
            ]),
            ("Networking & Service Discovery", "Connecting pods across dynamic cluster networks.", [
                ("Pod IP Ephemerality & ClusterIP Services", "Service selectors, stable cluster IP addresses, and CoreDNS service discovery.", "CODE", "yaml"),
                ("NodePort & LoadBalancer Service Types", "Exposing services on node ports and integrating cloud provider load balancers.", "CODE", "yaml"),
                ("Ingress Controllers & Path-Based Routing", "Nginx Ingress, host routing (api.domain.com), TLS certificate termination.", "CODE", "yaml"),
            ]),
            ("Configuration, Storage & Autoscaling", "Managing application state and dynamic traffic scaling.", [
                ("Decoupling Config: ConfigMaps & Secrets", "Mounting configuration files, environment variables, base64 encoded secrets.", "CODE", "yaml"),
                ("Persistent Storage: PersistentVolumes (PV) & PVCs", "StorageClasses, dynamic volume provisioning, AccessModes (RWO, RWX).", "CODE", "yaml"),
                ("Horizontal Pod Autoscaler (HPA) & Metrics Server", "Targeting CPU/memory utilization percentages and dynamic replica scaling.", "CODE", "yaml"),
            ]),
        ]
    },
    {
        "num": 65, "cat_key": "categoryF", "cat_name": "Cloud, DevOps, and Software Tools",
        "title": "CI/CD and DevOps", "code": "CLD505", "branch": "IT", "sem": 6, "diff": "Intermediate", "mins": 580,
        "short_desc": "Continuous Integration & Continuous Delivery: GitHub Actions pipelines, automated testing, and releases.",
        "desc": "Bridge software development and IT operations through automated delivery pipelines. Learn DevOps culture, CI/CD pipeline automation with GitHub Actions, automated linting and unit testing, container build pipelines, deployment strategies (blue-green, canary), and GitOps principles.",
        "skills": ["CI/CD Pipelines", "GitHub Actions", "Automated Testing Gates", "Blue-Green Deployments", "Canary Releases", "GitOps (ArgoCD)"],
        "prereqs": ["Git and GitHub", "Docker Fundamentals"],
        "objectives": ["Design automated Continuous Integration pipelines triggered by pull requests", "Implement GitHub Actions workflows with matrix builds, caching, and artifacts", "Execute zero-downtime blue-green and canary deployment release patterns", "Understand GitOps declarative deployment principles using tools like ArgoCD"],
        "thumb": "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("DevOps Culture & Continuous Integration (CI)", "Eliminating manual release bottlenecks and integration hell.", [
                ("The DevOps Philosophy & The Three Ways", "Systems thinking, amplifying feedback loops, and continuous experimentation.", "TEXT", "text"),
                ("Continuous Integration Principles & Automated Gates", "Frequent commits to trunk, automated test suites, and broken build accountability.", "TEXT", "text"),
                ("GitHub Actions Core: Workflows, Jobs & Steps", ".github/workflows YAML syntax, triggers (on: [push, pull_request]), runners.", "CODE", "yaml"),
            ]),
            ("Automating Quality: Linting, Tests & Caching", "Enforcing software quality standards in pull requests.", [
                ("Automated Testing & Coverage Reporting in Actions", "Running unit tests, publishing test results, and failing builds on low coverage.", "CODE", "yaml"),
                ("Dependency & Build Caching for Speed", "actions/cache action, caching node_modules, and reducing build times.", "CODE", "yaml"),
                ("Matrix Strategy & Cross-Environment Verification", "Testing across multiple Node.js/Python versions and OS runners simultaneously.", "CODE", "yaml"),
            ]),
            ("Continuous Delivery (CD) & Container Pipelines", "Automating artifact creation and secure image delivery.", [
                ("Automated Docker Image Build & Push to Registry", "Docker Buildx, multi-platform builds, authenticating to Docker Hub / GitHub GHCR.", "CODE", "yaml"),
                ("Secrets Management in CI/CD Environments", "GitHub encrypted repository secrets, environment protection rules, and OIDC tokens.", "CODE", "yaml"),
                ("Automated Semantic Versioning & Release Notes", "Release-please, git tags, semantic release, and publishing release artifacts.", "CODE", "yaml"),
            ]),
            ("Deployment Strategies & Modern GitOps", "Zero-downtime releases and infrastructure synchronization.", [
                ("Blue-Green Deployments vs Rolling Updates", "Zero-downtime traffic switching between production environments and instant rollbacks.", "TEXT", "text"),
                ("Canary Deployments & Progressive Traffic Shifting", "Routing 5% of traffic to canary releases, monitoring error rates before 100% rollout.", "TEXT", "text"),
                ("GitOps Principles & ArgoCD / Flux Overview", "Git as single source of truth, declarative cluster reconciliation loops.", "CODE", "yaml"),
            ]),
        ]
    },
    {
        "num": 66, "cat_key": "categoryF", "cat_name": "Cloud, DevOps, and Software Tools",
        "title": "AWS Cloud Fundamentals", "code": "CLD506", "branch": "IT", "sem": 5, "diff": "Intermediate", "mins": 600,
        "short_desc": "Amazon Web Services: EC2, S3, RDS, Lambda, VPC networking, IAM security, and CloudWatch.",
        "desc": "Master the world's most widely adopted cloud computing platform. Learn AWS Global Infrastructure (Regions, Availability Zones), Elastic Compute Cloud (EC2), Simple Storage Service (S3), Relational Database Service (RDS), Lambda serverless, VPC networking, and IAM policies.",
        "skills": ["AWS Global Infrastructure", "Amazon EC2 & S3", "Amazon RDS", "AWS Lambda", "VPC & Subnets", "AWS IAM"],
        "prereqs": ["Cloud Computing Fundamentals"],
        "objectives": ["Architect solutions following the AWS Well-Architected Framework 6 pillars", "Provision and configure secure virtual machines using Amazon EC2 and Security Groups", "Configure scalable object storage buckets with lifecycle policies using Amazon S3", "Deploy relational databases with automated backups and multi-AZ failover using Amazon RDS"],
        "thumb": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("AWS Global Infrastructure & IAM Security", "The foundation of Amazon Web Services security.", [
                ("AWS Regions, Availability Zones & Edge Locations", "Geographic redundancy, low-latency edge points of presence, and fault domains.", "TEXT", "text"),
                ("IAM Policies, Roles & Principle of Least Privilege", "JSON policy documents (Effect, Action, Resource), IAM roles for EC2 instances.", "CODE", "json"),
                ("AWS Well-Architected Framework: The 6 Pillars", "Operational Excellence, Security, Reliability, Performance, Cost, Sustainability.", "TEXT", "text"),
            ]),
            ("Compute & Serverless on AWS", "Running workloads elastically in the cloud.", [
                ("Amazon EC2: Instances, AMIs & User Data Scripts", "Instance types (t3, c6, r6), EBS volume attachments, bootstrapping with user data.", "CODE", "bash"),
                ("AWS Lambda & Serverless Compute", "Event triggers (S3, API Gateway), execution environments, memory and timeout configs.", "CODE", "python"),
                ("Elastic Load Balancing (ALB) & Auto Scaling Groups", "Target groups, health checks, dynamic scaling policies on CPU utilization.", "CODE", "json"),
            ]),
            ("Storage & Databases on AWS", "High-durability storage and managed databases.", [
                ("Amazon S3: Buckets, Storage Classes & Versioning", "11 9s durability, Standard, Infrequent Access, Glacier, pre-signed URLs.", "CODE", "python"),
                ("Amazon EBS: Block Storage & Snapshots", "gp3 vs io2 SSD volumes, IOPS provisioning, point-in-time EBS snapshots.", "TEXT", "text"),
                ("Amazon RDS & Aurora: Multi-AZ High Availability", "Managed PostgreSQL/MySQL, automated read replicas, multi-AZ synchronous standby.", "TEXT", "text"),
            ]),
            ("Networking & Observability on AWS", "Isolating resources and monitoring operational health.", [
                ("Amazon VPC: Subnets, Route Tables & Gateways", "CIDR blocks, public/private subnets, Internet Gateway, and NAT Gateway routing.", "CODE", "json"),
                ("Security Groups vs Network ACLs (NACL)", "Stateful instance firewalls vs stateless subnet perimeter traffic filtering.", "CODE", "json"),
                ("Amazon CloudWatch & CloudTrail Auditing", "Metrics, alarms, centralized log groups, and auditing API actions with CloudTrail.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 67, "cat_key": "categoryF", "cat_name": "Cloud, DevOps, and Software Tools",
        "title": "Microsoft Azure Fundamentals", "code": "CLD507", "branch": "IT", "sem": 5, "diff": "Intermediate", "mins": 580,
        "short_desc": "Microsoft Azure: Virtual Machines, Blob Storage, Azure SQL, Entra ID (Azure AD), and App Services.",
        "desc": "Build enterprise cloud solutions on Microsoft Azure. Learn Azure Resource Manager (ARM), subscription hierarchies, Azure Virtual Machines, Blob Storage, Azure SQL Database, Microsoft Entra ID (formerly Azure AD) identity management, and App Service PaaS hosting.",
        "skills": ["Azure Architecture", "Azure Resource Manager (ARM)", "Azure VMs & Blob Storage", "Microsoft Entra ID", "Azure App Services", "Azure SQL"],
        "prereqs": ["Cloud Computing Fundamentals"],
        "objectives": ["Navigate Azure Resource Groups, Subscriptions, and Management Group hierarchies", "Deploy web applications rapidly using Azure App Services and deployment slots", "Manage cloud identities, enterprise single sign-on, and RBAC using Microsoft Entra ID", "Configure scalable, tiered object storage using Azure Blob Storage"],
        "thumb": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Azure Core Architecture & Governance", "Organizing enterprise cloud resources systematically.", [
                ("Azure Subscriptions, Resource Groups & ARM Hierarchy", "Management groups, subscription billing scopes, and resource lifecycle boundaries.", "TEXT", "text"),
                ("Azure Resource Manager (ARM) & Bicep Templates", "Declarative JSON/Bicep templates for repeatable infrastructure deployments.", "CODE", "json"),
                ("Azure Policy & Role-Based Access Control (RBAC)", "Built-in roles (Owner, Contributor, Reader) and governance compliance enforcement.", "CODE", "json"),
            ]),
            ("Azure Compute & Platform Services (PaaS)", "Running apps with and without server management.", [
                ("Azure Virtual Machines & Scale Sets (VMSS)", "VM sizing series, availability sets, fault domains, and update domains.", "CODE", "bash"),
                ("Azure App Service: Web Apps & Deployment Slots", "Managed application runtime, blue-green staging slots, and custom domains.", "CODE", "bash"),
                ("Azure Functions: Serverless Event-Driven Compute", "Triggers (HTTP, Queue, Blob), input/output bindings, and consumption plans.", "CODE", "python"),
            ]),
            ("Storage & Data Solutions on Azure", "Structured and unstructured data stores.", [
                ("Azure Blob Storage: Hot, Cool, Cold & Archive Tiers", "Block blobs, page blobs, container access policies, and lifecycle management.", "CODE", "python"),
                ("Azure SQL Database: Elastic Pools & Managed Instances", "DTU vs vCore models, geo-replication, automated backups, and firewall rules.", "TEXT", "sql"),
                ("Azure Cosmos DB: Globally Distributed NoSQL", "Multi-model APIs, multi-region replication, and consistency levels.", "TEXT", "text"),
            ]),
            ("Azure Identity, Networking & Security", "Securing access across Azure virtual networks.", [
                ("Microsoft Entra ID (Azure AD) & Single Sign-On", "Tenants, users, app registrations, service principals, and Conditional Access.", "TEXT", "text"),
                ("Azure Virtual Networks (VNet) & Subnets", "VNet peering, Network Security Groups (NSGs), and Azure Bastion secure access.", "CODE", "json"),
                ("Azure Monitor & Application Insights", "Log Analytics workspaces, Kusto Query Language (KQL), application telemetry.", "CODE", "kql"),
            ]),
        ]
    },
    {
        "num": 68, "cat_key": "categoryF", "cat_name": "Cloud, DevOps, and Software Tools",
        "title": "Google Cloud Fundamentals", "code": "CLD508", "branch": "IT", "sem": 6, "diff": "Intermediate", "mins": 580,
        "short_desc": "Google Cloud Platform (GCP): Compute Engine, Cloud Storage, BigQuery, Cloud Run, and GKE.",
        "desc": "Harness Google's planetary-scale infrastructure for data, compute, and containers. Master GCP Resource Hierarchy, Compute Engine, Cloud Storage buckets, serverless container execution with Cloud Run, Google Kubernetes Engine (GKE), BigQuery analytics, and Cloud IAM.",
        "skills": ["GCP Resource Hierarchy", "Compute Engine & Cloud Storage", "Cloud Run (Serverless Containers)", "Google Kubernetes Engine (GKE)", "BigQuery Analytics", "Cloud IAM"],
        "prereqs": ["Cloud Computing Fundamentals"],
        "objectives": ["Understand Google Cloud's project hierarchy, billing accounts, and Cloud IAM permissions", "Deploy containerized services effortlessly using serverless Google Cloud Run", "Orchestrate production container clusters using Google Kubernetes Engine (GKE)", "Execute petabyte-scale analytical queries using Google BigQuery"],
        "thumb": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("GCP Hierarchy & Identity Access Management", "Google's resource tree and security model.", [
                ("GCP Resource Hierarchy: Org, Folders, Projects & Resources", "Inheritance of permissions, project IDs, and service enablement APIs.", "TEXT", "text"),
                ("Cloud IAM: Roles (Primitive, Predefined, Custom) & Service Accounts", "Binding members to roles, service account keys, and workload identity.", "CODE", "json"),
                ("Google Cloud CLI (gcloud) & Cloud Shell", "gcloud configuration, authenticating, and running commands from browser shells.", "CODE", "bash"),
            ]),
            ("GCP Compute & Serverless Containers", "Scalable compute solutions on Google infrastructure.", [
                ("Google Compute Engine (GCE) & Machine Types", "Preemptible / Spot VMs, persistent disks, and metadata startup scripts.", "CODE", "bash"),
                ("Google Cloud Run: Serverless Knative Containers", "Deploying arbitrary containers, scaling down to zero, and concurrency tuning.", "CODE", "bash"),
                ("Cloud Functions: Lightweight Event Handlers", "Eventarc triggers, Pub/Sub integration, and Python/Node runtimes.", "CODE", "python"),
            ]),
            ("Containers & Kubernetes on GCP (GKE)", "Google's managed Kubernetes powerhouse.", [
                ("Google Kubernetes Engine (GKE) Autopilot vs Standard", "Managed control planes, node pools, automated upgrades, and cluster autoscaling.", "CODE", "bash"),
                ("Artifact Registry: Secure Container Image Storage", "Storing Docker images, vulnerability scanning, and IAM access controls.", "CODE", "bash"),
                ("VPC-Native Clusters & Google Cloud Networking", "Global VPCs, regional subnets, Cloud NAT, and Cloud Armor DDoS defense.", "TEXT", "text"),
            ]),
            ("Storage & BigQuery Analytics", "High-durability storage and serverless data warehousing.", [
                ("Google Cloud Storage (GCS): Buckets & Classes", "Standard, Nearline, Coldline, Archive, dual-region buckets, and signed URLs.", "CODE", "python"),
                ("Google BigQuery: Serverless Distributed SQL", "Dremel execution engine, columnar storage (Capacitor), and slot reservations.", "CODE", "sql"),
                ("Cloud Pub/Sub: Real-Time Event Messaging", "Topics, subscriptions, pull vs push delivery, and dead-letter topics.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 69, "cat_key": "categoryF", "cat_name": "Cloud, DevOps, and Software Tools",
        "title": "Infrastructure as Code Fundamentals", "code": "CLD509", "branch": "CSE", "sem": 7, "diff": "Advanced", "mins": 620,
        "short_desc": "Terraform (HCL), state management, modules, providers, drift detection, and CI/CD deployment pipelines.",
        "desc": "Manage cloud infrastructure with software engineering rigor. Master HashiCorp Configuration Language (HCL), Terraform state locks (S3 + DynamoDB), resource graphs, declarative providers, reusable modules, plan/apply execution lifecycle, and drift detection.",
        "skills": ["Terraform (HCL)", "State Management & S3 Backend", "Terraform Modules", "Execution Plans (Plan/Apply)", "Drift Detection", "IaC Security"],
        "prereqs": ["Cloud Computing Fundamentals", "AWS or Azure Fundamentals"],
        "objectives": ["Author declarative cloud infrastructure templates using Terraform and HCL", "Manage remote state safely with S3 backends and DynamoDB distributed state locking", "Build reusable, modular infrastructure components across multiple deployment environments", "Detect and remediate infrastructure configuration drift in CI/CD pipelines"],
        "thumb": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("IaC Principles & Terraform Architecture", "Treating hardware infrastructure as version-controlled code.", [
                ("Imperative vs Declarative Infrastructure as Code", "API scripts vs desired-state convergence, idempotent updates, and auditability.", "TEXT", "text"),
                ("Terraform Core Architecture & Provider Plugins", "HashiCorp Configuration Language (HCL), provider registries, and DAG execution.", "TEXT", "text"),
                ("Terraform CLI Workflow: init, plan, apply & destroy", "Initializing plugins, analyzing execution plans, and managing destructive changes.", "CODE", "bash"),
            ]),
            ("State Management & Locking Mechanisms", "Tracking reality vs desired state safely across teams.", [
                ("The Terraform State File (terraform.tfstate)", "Mapping declared resources to real-world cloud IDs, metadata tracking.", "CODE", "json"),
                ("Remote State Storage & S3 / GCS Backends", "Securing sensitive state attributes and eliminating local state conflicts.", "CODE", "hcl"),
                ("Distributed State Locking with DynamoDB", "Preventing concurrent terraform apply executions and state corruption.", "CODE", "hcl"),
            ]),
            ("Variables, Outputs & Reusable Modules", "Structuring clean, parameterized, DRY infrastructure codebases.", [
                ("Variables, Locals & Outputs in HCL", "Type constraints (string, number, list, object), validation rules, locals.", "CODE", "hcl"),
                ("Building Custom Reusable Terraform Modules", "Module input contracts, output exports, and versioned Git module sources.", "CODE", "hcl"),
                ("Managing Multi-Environment Stacks (Dev, Staging, Prod)", "Terraform workspaces vs directory-based environment separation.", "CODE", "hcl"),
            ]),
            ("Advanced IaC, Drift Detection & Automation", "Production governance and automated pipeline delivery.", [
                ("Dynamic Blocks, for_each & Count Meta-Arguments", "Conditional resource provisioning and iterating over map collections.", "CODE", "hcl"),
                ("Drift Detection & Reconciliation", "Detecting out-of-band manual console changes using terraform refresh and plan.", "CODE", "bash"),
                ("Automated IaC Security Scanning with Checkov & Trivy", "Static analysis of HCL code for security misconfigurations and open ports.", "CODE", "bash"),
            ]),
        ]
    },
    {
        "num": 70, "cat_key": "categoryF", "cat_name": "Cloud, DevOps, and Software Tools",
        "title": "Monitoring and Application Observability", "code": "CLD510", "branch": "CSE", "sem": 7, "diff": "Advanced", "mins": 600,
        "short_desc": "The 3 pillars of observability: Prometheus metrics, Grafana dashboards, Jaeger distributed tracing, and ELK logs.",
        "desc": "Diagnose complex distributed system anomalies in real time. Master the three pillars of observability: metrics (Prometheus time series and PromQL), visualization (Grafana dashboards), centralized logging (Elasticsearch/Logstash/Kibana - ELK), and distributed tracing with OpenTelemetry and Jaeger.",
        "skills": ["Prometheus Metrics", "PromQL Query Language", "Grafana Dashboards", "Distributed Tracing (OpenTelemetry)", "ELK Stack", "Alertmanager & SLOs"],
        "prereqs": ["Distributed Systems Fundamentals", "Docker Fundamentals"],
        "objectives": ["Instrument web services with Prometheus metric types (Counter, Gauge, Histogram)", "Query time-series telemetry and calculate percentile latency using PromQL", "Build real-time operational monitoring dashboards in Grafana with Alertmanager alerts", "Trace request latency bottlenecks across microservices using OpenTelemetry and Jaeger"],
        "thumb": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("The 3 Pillars of Observability & Metrics", "Moving from simple black-box monitoring to deep white-box observability.", [
                ("Monitoring vs Observability: Metrics, Logs & Traces", "Known unknowns vs unknown unknowns, high-cardinality telemetry challenges.", "TEXT", "text"),
                ("The 4 Golden Signals: Latency, Traffic, Errors & Saturation", "Google SRE monitoring guidelines and USE / RED methods.", "TEXT", "text"),
                ("Prometheus Architecture & Pull-Based Metric Scraping", "Prometheus server, TSDB storage engine, scrape intervals, and exporter agents.", "TEXT", "text"),
            ]),
            ("Prometheus Instrumentation & PromQL", "Measuring application health and writing time-series queries.", [
                ("Prometheus Metric Types: Counter, Gauge, Histogram, Summary", "Monotonic counters, bucketed latency histograms, quantile summaries.", "CODE", "python"),
                ("PromQL Foundations: Vector Selectors & Rate Calculations", "Instant vectors, range vectors [5m], rate() vs irate() functions.", "CODE", "promql"),
                ("Histogram Quantiles & p95 / p99 Latency Math", "histogram_quantile(0.99, sum(rate(...)) by (le)) for SLA verification.", "CODE", "promql"),
            ]),
            ("Grafana Visualization & Alertmanager", "Transforming metrics into visual alerts and operational dashboards.", [
                ("Grafana Dashboards: Panels, Variables & Dynamic Templating", "Time series graphs, stat panels, heatmap visualizations, and dashboard variables.", "CODE", "json"),
                ("Prometheus Alerting Rules & Alertmanager", "Defining alerting thresholds, 'for: 5m' evaluation windows, and severity tags.", "CODE", "yaml"),
                ("Alert Routing: Slack, PagerDuty & On-Call Escalation", "Grouping, inhibiting cascading alerts, and silencing scheduled maintenance windows.", "CODE", "yaml"),
            ]),
            ("Centralized Logging & Distributed Tracing", "Following individual transactions across distributed architectures.", [
                ("Centralized Logging Architecture: ELK & Grafana Loki", "Log shippers (Filebeat, FluentBit), structured JSON logs, and logQL queries.", "CODE", "json"),
                ("Distributed Tracing Foundations: Spans, Traces & Context Propagation", "Trace IDs, parent-child span hierarchy, W3C TraceContext HTTP headers.", "CODE", "python"),
                ("OpenTelemetry (OTel) Standard & Jaeger UI", "OTel SDK instrumentation, exporting traces to Jaeger, identifying microservice bottlenecks.", "CODE", "python"),
            ]),
        ]
    },
]

print(f"Loaded {len(COURSES_D)} Category D courses, {len(COURSES_E)} Category E courses, and {len(COURSES_F)} Category F courses.")

