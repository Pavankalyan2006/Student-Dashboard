# Courses 71 to 100: Categories G, H, I, J

COURSES_G = [
    {
        "num": 71, "cat_key": "categoryG", "cat_name": "Electronics and Communication Engineering",
        "title": "Basic Electrical and Electronics Engineering", "code": "ECE601", "branch": "Common", "sem": 1, "diff": "Beginner", "mins": 520,
        "short_desc": "Ohm's law, Kirchhoff's laws (KCL/KVL), AC/DC circuits, semiconductor diodes, BJTs, and power supplies.",
        "desc": "Fundamental circuit theory and electronic devices for all engineering disciplines. Master Ohm's Law, Kirchhoff's Current and Voltage Laws, Thévenin and Norton theorems, AC sinusoidal steady-state analysis, p-n junction diodes, half/full-wave rectifiers, and Bipolar Junction Transistors (BJTs).",
        "skills": ["Kirchhoff's Laws (KCL/KVL)", "Thévenin & Norton Theorems", "AC Circuit Analysis", "Semiconductor Diodes", "Rectifiers & Filters", "BJT Basics"],
        "prereqs": ["None - Open to all engineering students"],
        "objectives": ["Analyze DC resistive circuits using Mesh Current and Nodal Voltage methods", "Simplify linear electrical networks using Thévenin and Norton equivalent circuits", "Calculate AC RMS voltage, phase angles, power factor, and complex impedance", "Understand p-n junction diode forward/reverse bias and design DC power supply rectifiers"],
        "thumb": "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("DC Circuit Theory & Network Theorems", "Lumped circuit laws and linear network reductions.", [
                ("Ohm's Law, Kirchhoff's Laws (KCL & KVL)", "Node voltages, mesh currents, sign conventions, and energy conservation.", "TEXT", "text"),
                ("Mesh & Nodal Analysis of Multi-Loop Circuits", "Constructing matrix equations for planar resistive networks.", "CODE", "python"),
                ("Network Theorems: Thévenin, Norton & Superposition", "Thévenin voltage V_th, Norton current I_n, R_th, and maximum power transfer theorem.", "CODE", "python"),
            ]),
            ("AC Circuit Analysis & Power Fundamentals", "Sinusoidal steady-state, phasors, and power factor.", [
                ("Sinusoidal Signals, Phasor Notation & Complex Impedance", "Peak, average, RMS values, resistance, inductive reactance X_L, capacitive X_C.", "CODE", "python"),
                ("Series & Parallel RLC Resonance", "Resonant frequency omega_0 = 1/sqrt(LC), bandwidth, quality factor Q.", "CODE", "python"),
                ("AC Power: Real, Reactive, Apparent Power & Power Factor", "Power triangle (P, Q, S), power factor correction capacitors.", "CODE", "python"),
            ]),
            ("Semiconductor Physics & P-N Diodes", "Solid-state electronic conduction and rectification.", [
                ("Intrinsic & Extrinsic Semiconductors (P-Type & N-Type)", "Doping, donor/acceptor impurities, majority/minority carriers, drift and diffusion.", "TEXT", "text"),
                ("The P-N Junction Diode & Shockley Equation", "Depletion region barrier potential, forward/reverse bias, V-I characteristic curve.", "TEXT", "text"),
                ("Diode Circuits: Half-Wave & Full-Wave Bridge Rectifiers", "Peak inverse voltage (PIV), ripple factor, capacitive filter smoothing, Zener regulation.", "CODE", "python"),
            ]),
            ("Transistors & Regulated Power Supplies", "Three-terminal active devices and basic linear electronics.", [
                ("Bipolar Junction Transistor (BJT) Physics & Configurations", "NPN vs PNP, Common Emitter (CE), Base, Collector, alpha and beta gains.", "TEXT", "text"),
                ("BJT Operating Regions: Cutoff, Active & Saturation", "DC load lines, Q-point stabilization, BJT as a digital electronic switch.", "CODE", "python"),
                ("DC Regulated Power Supply Architecture", "Step-down transformer, rectifier bridge, filter capacitor, 78xx linear IC regulator.", "TEXT", "text"),
            ]),
        ]
    },
    {
        "num": 72, "cat_key": "categoryG", "cat_name": "Electronics and Communication Engineering",
        "title": "Digital Electronics", "code": "ECE602", "branch": "ECE", "sem": 3, "diff": "Intermediate", "mins": 580,
        "short_desc": "Boolean algebra, Karnaugh maps (K-Maps), combinational logic (mux/demux), and sequential flip-flops/counters.",
        "desc": "The discrete mathematical and physical foundation of digital computing. Master Boolean logic theorems, De Morgan's laws, Karnaugh Map (K-Map) minimization, Quine-McCluskey, combinational logic (multiplexers, decoders, adders, ALUs), and sequential systems (latches, flip-flops, finite state machines).",
        "skills": ["Boolean Algebra", "Karnaugh Maps (K-Maps)", "Combinational Logic (Mux/Adders)", "Flip-Flops (SR, JK, D, T)", "Synchronous Counters", "Finite State Machines (FSM)"],
        "prereqs": ["Basic Electrical and Electronics Engineering"],
        "objectives": ["Minimize multi-variable Boolean expressions using Karnaugh Maps and Quine-McCluskey", "Design combinational logic systems including carry-lookahead adders and multiplexers", "Analyze race conditions, setup/hold times, and clock skew in edge-triggered flip-flops", "Synthesize synchronous finite state machines (Mealy and Moore models) using state tables"],
        "thumb": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Number Systems & Boolean Algebra", "Binary logic representations and canonical algebra.", [
                ("Binary, Hexadecimal, Two's Complement Arithmetic", "Radix conversions, signed integer representations, binary overflow detection.", "TEXT", "text"),
                ("Boolean Axioms, Theorems & De Morgan's Laws", "Duality principle, consensus theorem, Shannon expansion, and NAND/NOR universal gates.", "CODE", "verilog"),
                ("Canonical Forms: Sum of Products (SOP) & Product of Sums (POS)", "Minterms (m) and maxterms (M), converting truth tables into algebraic forms.", "TEXT", "text"),
            ]),
            ("Logic Minimization Techniques", "Reducing silicon gate count and propagation latency.", [
                ("Karnaugh Maps: 2, 3, 4 & 5 Variable K-Maps", "Gray code indexing, grouping adjacencies, prime implicants, essential prime implicants.", "TEXT", "text"),
                ("Don't Care Conditions (X) in Logic Minimization", "Exploiting invalid state combinations to achieve minimal transistor layouts.", "TEXT", "text"),
                ("Quine-McCluskey (Tabulation) Method", "Algorithmic tabular minimization suitable for automated computer CAD synthesis.", "CODE", "python"),
            ]),
            ("Combinational Logic Design", "Stateless logic processing pipelines.", [
                ("Adders & Subtractors: Half/Full Adder & Ripple Carry", "Propagation delays of ripple carry adders vs Carry-Lookahead generation/propagation.", "CODE", "verilog"),
                ("Multiplexers & Demultiplexers as Universal Logic", "Implementing arbitrary Boolean functions using 4:1 and 8:1 multiplexers.", "CODE", "verilog"),
                ("Decoders, Encoders & Priority Encoders", "2-to-4 and 3-to-8 active-low decoders, priority arbitration logic.", "CODE", "verilog"),
            ]),
            ("Sequential Logic & Finite State Machines", "Stateful memory circuits and clocked clock domains.", [
                ("Latches vs Flip-Flops: SR, JK, D & T Types", "Level-triggered transparent latches vs edge-triggered D flip-flops, race-around conditions.", "CODE", "verilog"),
                ("Timing Parameters: Setup Time, Hold Time & Clock Skew", "Metastability, clock jitter, timing violations in digital synthesis.", "TEXT", "text"),
                ("Finite State Machine (FSM) Design: Mealy vs Moore", "State assignment, state transition diagrams, excitation tables, synchronous up/down counters.", "CODE", "verilog"),
            ]),
        ]
    },
    {
        "num": 73, "cat_key": "categoryG", "cat_name": "Electronics and Communication Engineering",
        "title": "Analog Electronics", "code": "ECE603", "branch": "ECE", "sem": 3, "diff": "Intermediate", "mins": 620,
        "short_desc": "MOSFET & BJT small-signal models, Operational Amplifiers (Op-Amps), active filters, and feedback.",
        "desc": "Continuous-time analog circuit design and signal conditioning. Master MOSFET and BJT small-signal hybrid-pi models, differential pairs, Operational Amplifier (Op-Amp) linear and non-linear applications, negative feedback topologies, active filter design, and sinusoidal oscillators.",
        "skills": ["MOSFET Small-Signal Models", "BJT Hybrid-Pi Parameters", "Op-Amp Linear Circuits", "Negative Feedback Topologies", "Active Filters (Butterworth)", "Barkhausen Criterion"],
        "prereqs": ["Basic Electrical and Electronics Engineering"],
        "objectives": ["Derive small-signal voltage gain, input impedance, and output impedance of amplifier stages", "Design inverting, non-inverting, differential, and instrumentation operational amplifier circuits", "Analyze feedback amplifier stability using Bode magnitude/phase plots and phase margins", "Construct active low-pass, high-pass, and band-pass filters using Butterworth poles"],
        "thumb": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Transistor Biasing & Small-Signal Models", "Amplifying small analog signals with active devices.", [
                ("MOSFET Operation: Cutoff, Triode & Saturation", "Square-law I-V equations, threshold voltage V_th, channel-length modulation lambda.", "TEXT", "text"),
                ("BJT & MOSFET Small-Signal Hybrid-Pi Models", "Transconductance g_m, output resistance r_o, input resistance r_pi.", "CODE", "python"),
                ("Common-Source & Common-Emitter Amplifier Stages", "Voltage gain A_v, input/output resistance, and Miller effect capacitance.", "CODE", "python"),
            ]),
            ("Operational Amplifiers (Op-Amps) & Precision Circuits", "Ideal and non-ideal characteristics of differential building blocks.", [
                ("The Ideal Op-Amp & Virtual Short Concept", "Infinite input impedance, zero output impedance, infinite open-loop gain.", "TEXT", "text"),
                ("Linear Op-Amp Configurations: Inverting, Non-Inverting, Summing", "Closed-loop gain derivations, voltage followers, and difference amplifiers.", "CODE", "python"),
                ("Precision Instrumentation Amplifiers & CMRR", "3-Op-Amp topology, common-mode rejection ratio (CMRR), and biomedical sensor conditioning.", "CODE", "python"),
            ]),
            ("Feedback Amplifiers & Frequency Response", "Stabilizing gain and controlling bandwidth through negative feedback.", [
                ("The Four Feedback Topologies: Voltage/Current Series/Shunt", "Desensitivity of gain D = 1 + A*beta, input and output impedance transformations.", "TEXT", "text"),
                ("High-Frequency Amplifier Response & Bode Plots", "Poles and zeros, gain crossover frequency, phase crossover frequency, phase margin.", "CODE", "python"),
                ("Stability Criteria & Frequency Compensation", "Nyquist stability, dominant-pole compensation, and preventing circuit oscillations.", "TEXT", "text"),
            ]),
            ("Active Filters & Signal Generators", "Frequency-selective filtering and waveform synthesis.", [
                ("Active Low-Pass & High-Pass Sallen-Key Filters", "Second-order transfer functions, damping ratio, Butterworth maximally flat response.", "CODE", "python"),
                ("Non-Linear Op-Amp Circuits: Comparators & Schmitt Triggers", "Hysteresis voltage thresholds (V_TH, V_TL), eliminating input noise chatter.", "CODE", "python"),
                ("Sinusoidal Oscillators & Barkhausen Criterion", "Loop gain |A*beta| = 1 and phase shift 0/360 degrees, Wien Bridge, and Colpitts oscillators.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 74, "cat_key": "categoryG", "cat_name": "Electronics and Communication Engineering",
        "title": "Signals and Systems", "code": "ECE604", "branch": "ECE", "sem": 4, "diff": "Intermediate", "mins": 620,
        "short_desc": "Continuous & discrete signals, LTI systems, convolution, Fourier Series, Fourier Transform, and Laplace Transform.",
        "desc": "The foundational mathematical language of electrical and communication engineering. Study continuous-time and discrete-time signals, Linear Time-Invariant (LTI) system properties, impulse response, convolution integrals/sums, Fourier Series, Fourier Transform (FT), and Laplace Transforms.",
        "skills": ["LTI Systems", "Convolution Integral / Sum", "Fourier Series", "Continuous Fourier Transform", "Laplace Transform & ROC", "Z-Transform"],
        "prereqs": ["Engineering Mathematics"],
        "objectives": ["Classify signals by periodicity, energy/power, causality, and time-invariance", "Compute system outputs using continuous-time and discrete-time convolution", "Represent periodic waveforms using trigonometric and exponential Fourier Series", "Analyze LTI system stability and causality using Laplace transform poles and Region of Convergence (ROC)"],
        "thumb": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Signal Classification & Elementary Functions", "Mathematical representations of continuous and discrete information.", [
                ("Continuous vs Discrete Time & Energy vs Power Signals", "Signal energy E_inf, power P_inf, periodic signals, and fundamental frequency.", "CODE", "python"),
                ("Singularity Functions: Unit Step, Impulse & Ramp", "Dirac delta delta(t) sifting property, unit step u(t), and discrete Kronecker delta.", "CODE", "python"),
                ("Transformations of the Independent Variable", "Time shifting x(t - t0), time reversal x(-t), and time scaling x(at).", "CODE", "python"),
            ]),
            ("Linear Time-Invariant (LTI) Systems & Convolution", "Impulse responses and system characterization.", [
                ("LTI System Properties: Linearity, Time-Invariance, Causality, Stability", "BIBO (Bounded-Input Bounded-Output) stability absolute integrability condition.", "TEXT", "text"),
                ("Continuous-Time Convolution Integral", "Graphical and analytical convolution y(t) = integral x(tau) h(t - tau) dtau.", "CODE", "python"),
                ("Discrete-Time Convolution Sum", "Sliding dot products, commutative and distributive properties of convolution.", "CODE", "python"),
            ]),
            ("Fourier Analysis of Continuous Signals", "Decomposing temporal signals into harmonic frequency spectra.", [
                ("Continuous-Time Fourier Series (CTFS)", "Trigonometric and complex exponential forms, Euler formulas, line spectra.", "CODE", "python"),
                ("Continuous-Time Fourier Transform (CTFT)", "Forward transform X(omega) and inverse transform, duality, frequency shifting.", "CODE", "python"),
                ("Parseval's Theorem & Spectral Energy Density", "Energy conservation between time and frequency domains: integral |x(t)|^2 dt.", "CODE", "python"),
            ]),
            ("Laplace Transform & System Transfer Functions", "S-plane analysis for stable and unstable dynamic systems.", [
                ("The Bilateral & Unilateral Laplace Transform", "s = sigma + j omega complex frequency variable, definition integral.", "TEXT", "text"),
                ("Region of Convergence (ROC) Properties", "Strip of convergence, poles/zeros, and relationship to causality and stability.", "CODE", "python"),
                ("System Transfer Function H(s) & Inverse Laplace", "Partial fraction expansion, solving differential equations, pole-zero plots.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 75, "cat_key": "categoryG", "cat_name": "Electronics and Communication Engineering",
        "title": "Digital Signal Processing", "code": "ECE605", "branch": "ECE", "sem": 5, "diff": "Advanced", "mins": 660,
        "short_desc": "Discrete Fourier Transform (DFT), Fast Fourier Transform (FFT), Z-Transform, FIR filter design, and IIR filters.",
        "desc": "Digital processing and transformation of discrete signals. Master Nyquist-Shannon sampling theorem, anti-aliasing filters, Z-Transforms, Discrete Fourier Transform (DFT), Fast Fourier Transform (FFT Decimation-in-Time), FIR filter design using windowing, and IIR bilinear transformations.",
        "skills": ["Nyquist Sampling Theorem", "Z-Transform & Inverse Z", "Discrete Fourier Transform (DFT)", "Fast Fourier Transform (FFT)", "FIR Filter Design (Windowing)", "IIR Bilinear Transformation"],
        "prereqs": ["Signals and Systems"],
        "objectives": ["Prove the Nyquist-Shannon sampling theorem and eliminate spectral aliasing", "Compute the Z-Transform of discrete sequences and determine ROC stability bounds", "Implement the Radix-2 Cooley-Tukey Fast Fourier Transform (FFT) algorithm", "Design digital FIR filters using Hamming/Hanning windows and IIR filters via Bilinear Transform"],
        "thumb": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Sampling Theory & The Z-Transform", "Bridging continuous analog reality to discrete digital samples.", [
                ("Nyquist-Shannon Sampling Theorem & Aliasing", "Sampling frequency f_s >= 2*f_max, spectral replication, anti-aliasing low-pass filters.", "CODE", "python"),
                ("The Z-Transform: Definition & Region of Convergence (ROC)", "Z-plane pole-zero plots, unit circle stability criterion |z| = 1.", "CODE", "python"),
                ("Inverse Z-Transform: Contour Integration & Partial Fractions", "Long division method, residue theorem, partial fraction expansion.", "CODE", "python"),
            ]),
            ("Discrete Fourier Transform (DFT) & FFT Algorithms", "Efficient frequency spectrum computation in finite silicon.", [
                ("Discrete Fourier Transform (DFT) Mathematics", "N-point DFT matrix, twiddle factors W_N = e^(-j 2pi / N), circular convolution.", "CODE", "python"),
                ("Fast Fourier Transform: Radix-2 Cooley-Tukey Algorithm", "Decimation-in-Time (DIT) vs Decimation-in-Frequency (DIF), butterfly diagrams, O(N log N).", "CODE", "python"),
                ("Circular Convolution vs Linear Convolution", "Zero-padding sequences, overlap-add and overlap-save block filtering methods.", "CODE", "python"),
            ]),
            ("Finite Impulse Response (FIR) Filter Design", "Linear-phase digital filtering without feedback loops.", [
                ("Symmetric Impulse Responses & Linear Phase Invariants", "Type I, II, III, IV FIR filters, constant group and phase delay.", "TEXT", "text"),
                ("Windowing Design Method: Rectangular, Hamming, Blackman", "Main lobe width vs side lobe attenuation trade-offs in window functions.", "CODE", "python"),
                ("Frequency Sampling & Parks-McClellan Remez Algorithm", "Chebyshev equiripple approximation, optimal minimax filter design.", "CODE", "python"),
            ]),
            ("Infinite Impulse Response (IIR) Filter Design", "Recursive feedback digital filters modeled after analog prototypes.", [
                ("Analog Filter Prototypes: Butterworth & Chebyshev", "Maximally flat passband response vs equiripple steep cutoff transitions.", "CODE", "python"),
                ("Bilinear Transformation & Frequency Warping", "Mapping s-plane to z-plane, non-linear frequency warping omega = 2/T * tan(omega*T/2).", "CODE", "python"),
                ("Digital Filter Structures: Direct Form I/II & Cascade", "Canonic structures, coefficient quantization noise, and limit cycle oscillations.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 76, "cat_key": "categoryG", "cat_name": "Electronics and Communication Engineering",
        "title": "Communication Systems", "code": "ECE606", "branch": "ECE", "sem": 5, "diff": "Intermediate", "mins": 620,
        "short_desc": "Analog & digital modulation: AM, FM, PM, ASK, FSK, PSK, QAM, noise in communication (SNR), and Shannon capacity.",
        "desc": "Transmitting information across physical channels. Master amplitude modulation (DSB-SC, SSB), frequency modulation (Bessel functions, Carson's rule), digital passband modulation (BPSK, QPSK, QAM), white Gaussian noise (AWGN), matched filters, bit error rates (BER), and Shannon-Hartley channel capacity.",
        "skills": ["Amplitude Modulation (AM)", "Frequency Modulation (FM)", "Digital Modulation (BPSK/QPSK)", "QAM Constellations", "AWGN Channel & SNR", "Shannon Channel Capacity"],
        "prereqs": ["Signals and Systems", "Probability and Statistics"],
        "objectives": ["Model Amplitude Modulation (AM) and Frequency Modulation (FM) in time and frequency domains", "Calculate modulation index, transmission bandwidth (Carson's Rule), and power efficiency", "Demodulate digital binary and M-ary signals using optimal Matched Filter receivers", "Calculate channel capacity using the Shannon-Hartley theorem: C = B * log2(1 + SNR)"],
        "thumb": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Analog Amplitude Modulation Systems", "Baseband signal transmission by scaling carrier wave amplitude.", [
                ("Double Sideband Suppressed Carrier (DSB-SC) & Conventional AM", "Time-domain equations, modulation index mu, modulation efficiency, envelope detection.", "CODE", "python"),
                ("Single Sideband (SSB) & Vestigial Sideband (VSB)", "Hilbert transform phase-shift method, bandwidth reduction, television broadcasting.", "CODE", "python"),
                ("Superheterodyne Receiver Architecture", "RF tuning, mixer, local oscillator, intermediate frequency (IF 455 kHz), image frequency rejection.", "TEXT", "text"),
            ]),
            ("Angle Modulation: FM & PM", "Constant-envelope modulation resilient against amplitude noise.", [
                ("Phase Modulation (PM) vs Frequency Modulation (FM)", "Instantaneous frequency, frequency deviation Delta f, phase deviation.", "CODE", "python"),
                ("Narrowband FM vs Wideband FM & Bessel Functions", "J_n(beta) Bessel coefficients, Carson's bandwidth rule: BW = 2(Delta f + f_m).", "CODE", "python"),
                ("FM Generation & Demodulation: PLL & Discriminators", "Armstrong indirect method, phase-locked loop (PLL) tracking, pre-emphasis/de-emphasis.", "CODE", "python"),
            ]),
            ("Digital Baseband Transmission & Noise Analysis", "Pulse transmission and additive noise.", [
                ("Pulse Code Modulation (PCM): Sampling, Quantization, Encoding", "Uniform vs non-uniform quantization, mu-law / A-law companding, SQNR formula.", "CODE", "python"),
                ("Thermal Noise, AWGN & Noise Figure", "Johnson-Nyquist noise, power spectral density N0/2, signal-to-noise ratio (SNR).", "TEXT", "text"),
                ("The Matched Filter & Optimal Detection", "Maximizing output peak SNR, impulse response h(t) = s*(T - t), ISI and eye diagrams.", "CODE", "python"),
            ]),
            ("Digital Carrier Modulation & Information Theory", "Constellation spaces and theoretical capacity limits.", [
                ("Binary Shift Keying: ASK, FSK & BPSK", "Antipodal signaling, coherent vs non-coherent detection, Bit Error Rate (BER) curves.", "CODE", "python"),
                ("M-ary Schemes: QPSK & 16-QAM Constellations", "In-phase (I) and Quadrature (Q) carriers, spectral efficiency bits/s/Hz.", "CODE", "python"),
                ("Shannon-Hartley Theorem & Channel Capacity", "Information entropy H(X), channel capacity C = B * log2(1 + S/N), error-correcting codes.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 77, "cat_key": "categoryG", "cat_name": "Electronics and Communication Engineering",
        "title": "Microprocessors and Microcontrollers", "code": "ECE607", "branch": "ECE", "sem": 4, "diff": "Intermediate", "mins": 620,
        "short_desc": "Intel 8086 architecture, ARM Cortex-M, assembly programming, interrupts, timers, and peripheral interfacing.",
        "desc": "The embedded processing chips powering modern computing hardware. Study the internal architecture of 16-bit 8086 microprocessors (segmentation, instruction queue), 32-bit ARM Cortex-M processors, assembly language programming, interrupt controllers (NVIC), timers, GPIO, and UART serial communication.",
        "skills": ["Intel 8086 Architecture", "ARM Cortex-M Core", "Assembly Programming", "Interrupt Vectors (NVIC)", "GPIO & Peripheral Control", "UART / SPI / I2C"],
        "prereqs": ["Digital Electronics", "Computer Organization and Architecture"],
        "objectives": ["Understand 8086 memory segmentation (CS, DS, SS, ES) and 20-bit physical address math", "Write modular assembly routines with stack operations, string instructions, and macros", "Configure ARM Cortex-M nested vectored interrupt controllers (NVIC) and ISR priorities", "Interface external hardware (keypads, LCDs, ADCs) over GPIO and serial protocols"],
        "thumb": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Intel 8086 Microprocessor Architecture", "The historical foundation of the x86 personal computing architecture.", [
                ("Bus Interface Unit (BIU) & Execution Unit (EU)", "6-byte instruction prefetch queue, general registers (AX, BX, CX, DX), pointer registers.", "TEXT", "text"),
                ("Memory Segmentation & Physical Address Generation", "Segment:Offset calculation: Physical Address = (Segment * 16) + Offset.", "CODE", "assembly"),
                ("8086 Pin Diagram & Min/Max Modes", "Multiplexed address/data bus (AD0-AD15), ALE latching, HOLD/HLDA bus arbitration.", "TEXT", "text"),
            ]),
            ("Assembly Language Programming & Addressing Modes", "Low-level machine instruction construction.", [
                ("8086 Addressing Modes: Register, Immediate, Direct, Based, Indexed", "Base-index-displacement effective address calculations.", "CODE", "assembly"),
                ("Instruction Set: Data Transfer, Arithmetic, Logic & Branching", "MOV, PUSH/POP, ADD/SUB, CMP, JMP, conditional jumps, string primitives (MOVSB).", "CODE", "assembly"),
                ("Subroutines, Stack Frames & Macro Directives", "CALL/RET mechanics, stack parameters, local variable space, MACRO vs PROC.", "CODE", "assembly"),
            ]),
            ("Interrupts & Peripheral Interfacing (8255 / 8259)", "Coordinating real-time hardware events.", [
                ("8086 Interrupt Vector Table (IVT) & Interrupt Types", "Type 0 to 255 interrupts, dedicated vectors, hardware INTR/NMI vs software INT n.", "TEXT", "text"),
                ("8255 Programmable Peripheral Interface (PPI)", "Control word formats, Port A, B, C, Bit Set/Reset (BSR) mode, Mode 0/1/2 handshakes.", "CODE", "assembly"),
                ("8259 Programmable Interrupt Controller (PIC)", "Cascaded master/slave priority resolution, ICW/OCW initialization commands.", "CODE", "assembly"),
            ]),
            ("ARM Cortex-M Architecture & Modern Microcontrollers", "The dominant 32-bit RISC core in contemporary embedded devices.", [
                ("ARM Cortex-M Core: Registers, Thumb-2 ISA & Pipelines", "R0-R15, Program Status Register (xPSR), dual stack pointers (MSP vs PSP).", "TEXT", "text"),
                ("Nested Vectored Interrupt Controller (NVIC)", "Tail-chaining, late arrival preemption, priority grouping, low-latency ISRs.", "CODE", "c"),
                ("Peripheral Programming: GPIO, Timers & UART", "Memory-mapped I/O registers, configuring clocks, baud rate generation, circular buffers.", "CODE", "c"),
            ]),
        ]
    },
    {
        "num": 78, "cat_key": "categoryG", "cat_name": "Electronics and Communication Engineering",
        "title": "Embedded Systems", "code": "ECE608", "branch": "ECE", "sem": 6, "diff": "Advanced", "mins": 660,
        "short_desc": "Embedded C, Real-Time Operating Systems (FreeRTOS), task scheduling, priority inversion, and drivers.",
        "desc": "Design deterministic, resource-constrained electronic firmware. Master embedded C programming, bare-metal hardware register drivers, Real-Time Operating Systems (FreeRTOS), preemptive priority-based task scheduling, semaphores, queues, and priority inheritance.",
        "skills": ["Embedded C", "Bare-Metal Register Drivers", "FreeRTOS", "Preemptive Task Scheduling", "Priority Inversion & Inheritance", "Watchdog Timers"],
        "prereqs": ["Microprocessors and Microcontrollers", "Programming Fundamentals with C"],
        "objectives": ["Write bare-metal register-level device drivers in C using volatile memory pointers", "Configure and deploy FreeRTOS on microcontrollers with deterministic task priorities", "Prevent priority inversion bugs in real-time tasks using priority inheritance mutexes", "Implement low-power sleep modes and hardware watchdog timers for fault recovery"],
        "thumb": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Embedded C & Bare-Metal Driver Engineering", "Programming silicon hardware registers directly in C.", [
                ("The Volatile Keyword & Memory-Mapped Registers", "Preventing compiler optimization caching on hardware peripheral registers.", "CODE", "c"),
                ("Bit Manipulation Macros & Register Masking", "Setting, clearing, and toggling hardware bitfields with bitwise operators.", "CODE", "c"),
                ("Startup Code, Linker Scripts & Memory Mapping", "Vector table placement, initializing .data and zeroing .bss in Flash and RAM.", "CODE", "c"),
            ]),
            ("Real-Time Operating Systems (RTOS) Core", "Deterministic task execution guarantees.", [
                ("General Purpose OS vs Real-Time Operating Systems (RTOS)", "Hard vs Soft real-time constraints, deterministic latency vs throughput.", "TEXT", "text"),
                ("FreeRTOS Task Creation, TCB & Stack Allocation", "xTaskCreate, Task Control Blocks, task states (Ready, Running, Blocked, Suspended).", "CODE", "c"),
                ("Preemptive Fixed-Priority Scheduling & SysTick", "Tick interrupts, context switching, round-robin timeslicing for equal priorities.", "CODE", "c"),
            ]),
            ("Inter-Task Communication & Synchronization", "Coordinating concurrent real-time tasks safely.", [
                ("FreeRTOS Queues: Thread-Safe FIFO Buffers", "xQueueCreate, xQueueSend, xQueueReceive, zero-copy pointer queues.", "CODE", "c"),
                ("Binary & Counting Semaphores", "Signaling between interrupt service routines (FromISR) and worker tasks.", "CODE", "c"),
                ("Mutexes, Priority Inversion & Priority Inheritance", "Unbounded priority inversion case study (Mars Pathfinder), ceiling protocols.", "CODE", "c"),
            ]),
            ("Embedded Reliability, Power & Protocols", "Industrial-grade hardware reliability and low-power techniques.", [
                ("Hardware Watchdog Timers (WDT) & Reset Handlers", "Windowed watchdogs, pet/kick watchdog loops, recovering from code lockups.", "CODE", "c"),
                ("Low-Power Sleep Modes & Energy Harvesting", "Clock gating, CPU sleep, stop, standby modes, and external wake-up pins.", "CODE", "c"),
                ("Bus Protocols: I2C & SPI Drivers", "I2C clock stretching, ACK/NACK, SPI full-duplex chip-select shift registers.", "CODE", "c"),
            ]),
        ]
    },
    {
        "num": 79, "cat_key": "categoryG", "cat_name": "Electronics and Communication Engineering",
        "title": "Internet of Things Fundamentals", "code": "ECE609", "branch": "ECE", "sem": 6, "diff": "Intermediate", "mins": 580,
        "short_desc": "IoT architecture, ESP32, wireless sensor networks (MQTT/CoAP), BLE, LoRaWAN, and cloud telemetry.",
        "desc": "Connect physical sensors and actuators to cloud computing networks. Master IoT 4-layer architecture, ESP32 microcontroller programming, sensor interfacing (I2C/SPI), lightweight wireless IoT communication protocols (MQTT, CoAP), Bluetooth Low Energy (BLE), LoRaWAN long-range networking, and cloud IoT ingestion.",
        "skills": ["IoT Architecture", "ESP32 Microcontroller", "MQTT Protocol (QoS)", "CoAP", "BLE & LoRaWAN", "Cloud IoT Ingestion"],
        "prereqs": ["Computer Networks", "Embedded Systems"],
        "objectives": ["Architect scalable IoT solutions across sensor, edge, network, and cloud layers", "Interface environmental and inertial sensors to ESP32 microcontrollers", "Implement lightweight, low-bandwidth publish-subscribe messaging using MQTT", "Design long-range low-power sensor telemetry networks using LoRaWAN protocol gateways"],
        "thumb": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("IoT Architecture & Edge Hardware", "The bridge between physical environments and the digital web.", [
                ("The 4-Layer IoT Architecture: Perception, Edge, Network, Cloud", "Sensors, edge computing gateways, telemetry transmission, and analytics platforms.", "TEXT", "text"),
                ("The ESP32 Dual-Core SoC & Wi-Fi/BLE Architecture", "Tensilica Xtensa cores, pin multiplexing, ADC calibration, and deep sleep modes.", "CODE", "c"),
                ("Interfacing Analog & Digital Sensors", "Reading I2C temperature/humidity sensors (BME280) and SPI motion sensors.", "CODE", "c"),
            ]),
            ("Lightweight IoT Application Protocols", "Optimized protocols for bandwidth-constrained, lossy networks.", [
                ("MQTT Protocol: Publish-Subscribe Architecture", "MQTT Broker, topics (/sensors/temp), wildcards (+ and #), keepalive pings.", "CODE", "python"),
                ("MQTT Quality of Service (QoS) Levels & Retained Messages", "QoS 0 (At most once), QoS 1 (At least once), QoS 2 (Exactly once), Last Will and Testament.", "TEXT", "text"),
                ("Constrained Application Protocol (CoAP)", "UDP transport, RESTful GET/POST over binary headers, asynchronous observe.", "CODE", "python"),
            ]),
            ("Wireless IoT Connectivity: BLE, Zigbee & LoRaWAN", "Short-range and long-range low-power wireless standards.", [
                ("Bluetooth Low Energy (BLE): GAP & GATT Profiles", "Central vs Peripheral roles, Services, Characteristics, advertising beacons.", "CODE", "c"),
                ("Zigbee & Wireless Mesh Networks (IEEE 802.15.4)", "Self-healing mesh routing, coordinators, routers, and end devices.", "TEXT", "text"),
                ("LoRa & LoRaWAN Long-Range Technology", "Chirp Spread Spectrum (CSS) modulation, spreading factors (SF7-SF12), gateways.", "CODE", "python"),
            ]),
            ("Cloud IoT Integration, Edge Computing & Security", "Ingesting and acting on real-time sensor streams.", [
                ("Edge Processing & MicroPython / CircuitPython", "Running embedded Python on edge microcontrollers for local heuristic filtering.", "CODE", "python"),
                ("Cloud IoT Gateways: AWS IoT Core & Azure IoT Hub", "X.509 device certificates, device shadows/twins, and real-time telemetry rules.", "CODE", "json"),
                ("IoT Cybersecurity Challenges & Firmware OTA Updates", "Over-The-Air (OTA) cryptographically signed firmware rollouts and tamper defense.", "CODE", "c"),
            ]),
        ]
    },
    {
        "num": 80, "cat_key": "categoryG", "cat_name": "Electronics and Communication Engineering",
        "title": "VLSI Design Fundamentals", "code": "ECE610", "branch": "ECE", "sem": 7, "diff": "Advanced", "mins": 660,
        "short_desc": "CMOS logic, stick diagrams, propagation delay (Elmore), dynamic power dissipation, and Verilog synthesis.",
        "desc": "Design integrated circuits containing billions of nanoscale transistors. Master CMOS inverter static and dynamic behavior, layout stick diagrams, lambda design rules, Elmore delay models, logical effort sizing, clock distribution networks, and Verilog HDL RTL synthesis.",
        "skills": ["CMOS Inverter Transfer Curve", "Stick Diagrams & Layout", "Elmore Delay Model", "Logical Effort Sizing", "Dynamic & Static Power Dissipation", "Verilog RTL Synthesis"],
        "prereqs": ["Digital Electronics", "Analog Electronics"],
        "objectives": ["Analyze CMOS inverter voltage transfer characteristics (VTC) and noise margins", "Construct layout stick diagrams satisfying scalable lambda design rules", "Calculate RC propagation delays across multi-stage logic paths using Elmore delay", "Synthesize and optimize digital circuits written in Verilog HDL for area and speed"],
        "thumb": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("MOS Transistor Physics & CMOS Inverter", "The basic building block of integrated circuits.", [
                ("MOSFET Fabrication: N-Well, Twin-Tub CMOS Process", "Silicon oxidation, photolithography, ion implantation, metallization.", "TEXT", "text"),
                ("CMOS Inverter Voltage Transfer Characteristics (VTC)", "Noise margins (NM_L, NM_H), threshold switching voltage V_th, regenerative gain.", "CODE", "python"),
                ("Static CMOS Complementary Logic Gates", "Pull-Up Network (PUN pMOS) and Pull-Down Network (PDN nMOS) dual synthesis.", "CODE", "verilog"),
            ]),
            ("Layout, Design Rules & Stick Diagrams", "Translating schematic circuits to physical lithography masks.", [
                ("Stick Diagrams & Color-Coded Layer Conventions", "Polysilicon, diffusion (n+/p+), metal layers, contacts, and Euler paths.", "TEXT", "text"),
                ("Mead-Conway Lambda Design Rules", "Minimum width, spacing, enclosure rules to prevent physical short circuits.", "TEXT", "text"),
                ("Standard Cell Methodology & Area Optimization", "Fixed-height standard cell libraries, routing channels, and abutment.", "TEXT", "text"),
            ]),
            ("Delay, Timing & Logical Effort", "Engineering nanosecond propagation speeds through logic paths.", [
                ("RC Delay Models & Elmore Delay Formulation", "Lumped RC ladder network delay approximation: sum R_i * C_downstream.", "CODE", "python"),
                ("The Method of Logical Effort (Sutherland)", "Logical effort g, electrical effort (fanout) h, parasitic delay p, path effort F.", "CODE", "python"),
                ("Optimal Transistor Sizing for Speed", "Balancing stage efforts to achieve minimum path delay across logic gates.", "CODE", "python"),
            ]),
            ("Power Dissipation & Verilog RTL Synthesis", "Managing heat dissipation and automated silicon compilation.", [
                ("Power Dissipation in CMOS: Dynamic, Short-Circuit & Subthreshold Leakage", "P_dyn = C_L * V_DD^2 * f * alpha, clock gating, power-delay product.", "CODE", "python"),
                ("Clock Distribution Networks & Clock Skew (H-Tree)", "Clock buffers, balanced H-tree topologies, setup/hold slack timing closure.", "TEXT", "text"),
                ("RTL to GDSII Flow & Synthesis Constraints", "Logic synthesis with Synopsys Design Compiler, place and route, static timing analysis (STA).", "CODE", "verilog"),
            ]),
        ]
    },
]

COURSES_H = [
    {
        "num": 81, "cat_key": "categoryH", "cat_name": "Electrical Engineering",
        "title": "Electrical Circuit Analysis", "code": "EEE701", "branch": "EEE", "sem": 3, "diff": "Intermediate", "mins": 600,
        "short_desc": "Transient analysis (first/second order), two-port networks, three-phase power, and graph theory.",
        "desc": "Advanced analytical methods for complex linear electrical networks. Study first-order RL/RC and second-order RLC differential transient responses, two-port network parameters (z, y, h, ABCD), graph theory incidence matrices, and balanced/unbalanced three-phase systems.",
        "skills": ["RL/RC/RLC Transients", "Two-Port Networks (Z, Y, ABCD)", "Three-Phase Power (Delta/Wye)", "Network Graph Theory", "Mutual Inductance & Transformers"],
        "prereqs": ["Basic Electrical and Electronics Engineering", "Engineering Mathematics"],
        "objectives": ["Solve differential equations governing first and second-order RLC transient responses", "Calculate Z, Y, hybrid h, and transmission ABCD parameters for two-port networks", "Analyze balanced and unbalanced 3-phase circuits with Wye (Y) and Delta (Delta) loads", "Apply graph theory (incidence and cut-set matrices) to automate network solutions"],
        "thumb": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Transient Analysis of First & Second-Order Circuits", "Dynamic time-domain response to abrupt switching.", [
                ("First-Order RL & RC Natural and Step Response", "Time constant tau = L/R or RC, initial conditions, continuity of capacitor voltage and inductor current.", "CODE", "python"),
                ("Second-Order RLC Circuits: Overdamped, Critically Damped, Underdamped", "Damping factor zeta, natural frequency omega_n, characteristic roots.", "CODE", "python"),
                ("Laplace Domain S-Domain Circuit Analysis", "Replacing inductors with sL and capacitors with 1/sC with initial condition sources.", "CODE", "python"),
            ]),
            ("Two-Port Network Parameters", "Characterizing four-terminal electrical sub-networks.", [
                ("Impedance (Z) & Admittance (Y) Parameters", "Open-circuit and short-circuit measurement derivations, parameter conversions.", "CODE", "python"),
                ("Hybrid (h) & Transmission (ABCD) Parameters", "Transistor modeling with h-parameters, long power line cascade ABCD matrices.", "CODE", "python"),
                ("Interconnection of Two-Port Networks", "Series, parallel, and cascade connections of two-port systems.", "CODE", "python"),
            ]),
            ("Three-Phase Balanced & Unbalanced Systems", "The backbone of industrial electrical generation and distribution.", [
                ("Three-Phase Voltages, Phase Sequence & Wye/Delta Connections", "Line vs phase voltages (V_L = sqrt(3) V_ph) and line vs phase currents.", "CODE", "python"),
                ("Three-Phase Power Measurement (Two-Wattmeter Method)", "Derivation: W1 + W2 = Total Power, tan(phi) = sqrt(3)(W1 - W2)/(W1 + W2).", "CODE", "python"),
                ("Unbalanced Three-Phase Loads & Neutral Current", "Four-wire systems, floating neutral shift, and symmetrical components overview.", "CODE", "python"),
            ]),
            ("Network Topology & Magnetically Coupled Circuits", "Automating topological circuit solutions.", [
                ("Network Graph Theory: Trees, Co-Trees, Links & Twigs", "Incidence matrix A, fundamental tie-set matrix, and fundamental cut-set matrix.", "CODE", "python"),
                ("Mutual Inductance & Dot Convention", "Coupling coefficient k = M / sqrt(L1 L2), series aiding/opposing inductors.", "CODE", "python"),
                ("The Ideal Linear Transformer & Reflected Impedance", "Turns ratio N1/N2, impedance reflection Z_in = (N1/N2)^2 * Z_L.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 82, "cat_key": "categoryH", "cat_name": "Electrical Engineering",
        "title": "Electrical Machines", "code": "EEE702", "branch": "EEE", "sem": 4, "diff": "Intermediate", "mins": 640,
        "short_desc": "Transformers, DC machines (generators/motors), 3-phase induction motors, and synchronous alternators.",
        "desc": "Electromechanical energy conversion principles and heavy electrical machinery. Study magnetic circuits, single-phase/three-phase transformers (open/short circuit tests), DC generators and motors (speed-torque characteristics), three-phase squirrel-cage induction motors, and synchronous alternators.",
        "skills": ["Transformer Equivalent Circuit", "DC Motor Speed Control", "Induction Motor Torque-Slip Curves", "Synchronous Alternators", "Electromechanical Energy Conversion"],
        "prereqs": ["Electrical Circuit Analysis"],
        "objectives": ["Construct transformer equivalent circuits from open-circuit and short-circuit test data", "Analyze DC motor speed-torque curves and implement armature voltage speed control", "Calculate induction motor slip, rotor frequency, air-gap power, and mechanical torque", "Model synchronous alternators and determine voltage regulation using the EMF method"],
        "thumb": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Magnetic Circuits & Single-Phase Transformers", "Electromagnetic induction and voltage transformation.", [
                ("Magnetic Circuits, Reluctance & B-H Hysteresis Loops", "Ampere's circuital law, magnetic flux, permeability, hysteresis and eddy current losses.", "TEXT", "text"),
                ("Ideal vs Practical Single-Phase Transformers", "EMF equation E = 4.44 f N Phi_m, leakage flux, winding resistance, magnetizing branch.", "CODE", "python"),
                ("Open-Circuit & Short-Circuit Testing", "Extracting core loss resistance R_c, magnetizing reactance X_m, and copper losses.", "CODE", "python"),
            ]),
            ("DC Machines: Generators & Motors", "Commutated electromagnetic rotational energy conversion.", [
                ("DC Machine Construction, Armature Windings & Commutator", "Lap and wave windings, EMF equation E = (P Phi N Z) / (60 A).", "TEXT", "text"),
                ("DC Generators: Separately Excited, Shunt & Compound", "External characteristics, voltage buildup in self-excited generators, critical resistance.", "CODE", "python"),
                ("DC Motors: Back EMF & Speed-Torque Characteristics", "Torque equation T = k Phi I_a, Ward-Leonard speed control, DC motor starters.", "CODE", "python"),
            ]),
            ("Three-Phase Induction Motors", "The ubiquitous industrial AC asynchronous motor.", [
                ("Rotating Magnetic Field (RMF) Production", "Constant magnitude 1.5 Phi_m rotating at synchronous speed N_s = 120f / P.", "TEXT", "text"),
                ("Slip & Equivalent Circuit of Induction Motor", "Slip s = (N_s - N)/N_s, rotor frequency f_r = s*f, equivalent circuit components.", "CODE", "python"),
                ("Torque-Slip Characteristics & Motor Starting Methods", "Starting torque, maximum breakdown torque, DOL, Star-Delta, and autotransformer starters.", "CODE", "python"),
            ]),
            ("Synchronous Machines & Alternators", "Constant-speed AC generation for global power grids.", [
                ("Synchronous Generator (Alternator) Architecture", "Salient-pole vs cylindrical rotor construction, pitch and distribution winding factors.", "TEXT", "text"),
                ("Voltage Regulation & Synchronous Impedance Method", "Open-circuit characteristic (OCC), short-circuit characteristic (SCC), synchronous reactance X_s.", "CODE", "python"),
                ("Synchronous Motors: V-Curves & Power Factor Correction", "Excitation variations, inverted V-curves, synchronous condenser operation.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 83, "cat_key": "categoryH", "cat_name": "Electrical Engineering",
        "title": "Power Systems", "code": "EEE703", "branch": "EEE", "sem": 5, "diff": "Advanced", "mins": 660,
        "short_desc": "Transmission line modeling, Newton-Raphson load flow, symmetrical/unsymmetrical faults, and protection.",
        "desc": "Large-scale generation, transmission, and protection of electrical energy grids. Master overhead transmission line inductance and capacitance models, ABCD line parameters, Newton-Raphson power flow solutions, symmetrical components fault calculations, and protective relaying.",
        "skills": ["Transmission Line Modeling", "Power Flow (Newton-Raphson)", "Symmetrical Components", "Fault Analysis (LG, LLG, LLL)", "Protective Relaying", "Grid Stability"],
        "prereqs": ["Electrical Circuit Analysis", "Electrical Machines"],
        "objectives": ["Compute transmission line parameters: inductance with GMD/GMR and capacitance", "Solve complex non-linear power flow networks using the Newton-Raphson algorithm", "Calculate symmetrical and unsymmetrical fault currents (Single Line-to-Ground, Line-to-Line)", "Configure protective directional overcurrent and distance impedance relays"],
        "thumb": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Transmission Line Parameters & Performance", "Modeling long-distance electrical energy conduits.", [
                ("Line Inductance: Geometric Mean Distance (GMD) & GMR", "Internal vs external flux linkage, bundled conductors, composite conductors.", "CODE", "python"),
                ("Line Capacitance & Electric Field Distribution", "Potential difference between conductors, charging current, earth effect.", "CODE", "python"),
                ("Short, Medium & Long Line Models (Nominal Pi/Tee)", "Hyperbolic propagation constant gamma = alpha + j*beta, Ferranti effect, surge impedance.", "CODE", "python"),
            ]),
            ("Power Flow Analysis & Grid Computation", "Solving bus voltages and power injections across interconnected networks.", [
                ("The Bus Admittance Matrix (Y_bus) Formation", "Singular transformation and direct inspection methods, tap-changing transformers.", "CODE", "python"),
                ("Bus Classifications: Slack, Generator (PV), Load (PQ)", "Unknown state variables, real and reactive power mismatch equations.", "TEXT", "text"),
                ("Newton-Raphson Load Flow Algorithm", "Jacobian matrix structure (J1, J2, J3, J4), quadratic convergence, polar coordinates.", "CODE", "python"),
            ]),
            ("Fault Analysis & Symmetrical Components", "Network behavior during catastrophic electrical short circuits.", [
                ("Symmetrical Faults: Symmetrical Short-Circuit Current", "Subtransient, transient, and steady-state periods, circuit breaker rating selection.", "CODE", "python"),
                ("Fortescue's Symmetrical Components (Positive, Negative, Zero)", "Transformation matrix A, sequence impedance networks of generators and transformers.", "CODE", "python"),
                ("Unsymmetrical Faults: LG, LL & LLG Faults", "Interconnection of sequence networks for Single Line-to-Ground and Line-to-Line faults.", "CODE", "python"),
            ]),
            ("Power System Protection & Grid Stability", "Isolating network faults and ensuring rotor angle equilibrium.", [
                ("Protective Relaying Principles: Overcurrent & Differential", "Current transformers (CT), potential transformers (PT), Buchholz relay protection.", "TEXT", "text"),
                ("Distance Relaying: Impedance, Reactance & Mho Relays", "Three-zone distance protection on high-voltage transmission corridors.", "CODE", "python"),
                ("Rotor Angle Stability & The Equal Area Criterion", "Swing equation M d^2delta/dt^2 = P_m - P_e, critical clearing angle and time.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 84, "cat_key": "categoryH", "cat_name": "Electrical Engineering",
        "title": "Control Systems", "code": "EEE704", "branch": "EEE", "sem": 5, "diff": "Intermediate", "mins": 620,
        "short_desc": "Transfer functions, block diagrams, Root Locus, Bode plots, Nyquist stability, and PID tuning.",
        "desc": "Dynamic feedback system modeling and closed-loop controller design. Master Laplace transfer functions, block diagram algebra, signal flow graphs (Mason's Gain Rule), Routh-Hurwitz stability criterion, Root Locus trajectories, Bode plots, Nyquist stability criterion, and PID controller tuning.",
        "skills": ["Transfer Functions", "Block Diagram Algebra", "Routh-Hurwitz Stability", "Root Locus Method", "Bode & Nyquist Plots", "PID Controller Tuning"],
        "prereqs": ["Engineering Mathematics", "Signals and Systems"],
        "objectives": ["Reduce complex feedback block diagrams using Mason's Gain Rule", "Determine absolute stability of closed-loop systems using the Routh-Hurwitz criterion", "Construct Root Locus diagrams and analyze transient damping ratios", "Design proportional-integral-derivative (PID) controllers using Ziegler-Nichols tuning"],
        "thumb": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Mathematical Modeling of Physical Systems", "Representing dynamic mechanical and electrical systems in the s-domain.", [
                ("Open-Loop vs Closed-Loop Feedback Control", "Disturbance rejection, sensitivity reduction, and closed-loop transfer functions.", "TEXT", "text"),
                ("Block Diagram Reduction Algebra", "Moving summing junctions and pick-off points, canonical feedback loops.", "CODE", "python"),
                ("Signal Flow Graphs & Mason's Gain Formula", "Forward paths, individual loops, non-touching loop determinants.", "CODE", "python"),
            ]),
            ("Time-Domain Analysis & Absolute Stability", "Transient specifications and polynomial root stability.", [
                ("Standard Test Signals & Second-Order Step Response", "Damping ratio zeta, rise time t_r, peak time t_p, maximum percentage overshoot (%OS).", "CODE", "python"),
                ("Steady-State Error Analysis & System Types", "Position, velocity, and acceleration error constants (K_p, K_v, K_a).", "CODE", "python"),
                ("Routh-Hurwitz Stability Criterion", "Routh array construction, special cases (zero in first column, all-zero rows).", "CODE", "python"),
            ]),
            ("The Root Locus Technique", "Tracking closed-loop pole migrations as open-loop gain K varies.", [
                ("Root Locus Rules & Angle/Magnitude Criteria", "Asymptotes, centroid, breakaway/break-in points, imaginary axis crossings.", "CODE", "python"),
                ("Transient Response Design via Root Locus", "Selecting gain K to satisfy damping ratio zeta and settling time t_s bounds.", "CODE", "python"),
                ("Lead and Lag Compensator Design", "Phase lead for transient speedup, phase lag for steady-state error reduction.", "CODE", "python"),
            ]),
            ("Frequency-Domain Analysis & PID Tuning", "Bode plots, Nyquist stability, and practical industrial controllers.", [
                ("Bode Plots: Gain Margin & Phase Margin", "Asymptotic log-magnitude and phase angle curves, stability margins.", "CODE", "python"),
                ("The Nyquist Stability Criterion & Cauchy's Argument Principle", "Nyquist contour mapping, encirclement of (-1, j0) point: N = Z - P.", "CODE", "python"),
                ("PID Controllers & Ziegler-Nichols Tuning Rules", "Proportional, Integral, Derivative actions, oscillation period tuning.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 85, "cat_key": "categoryH", "cat_name": "Electrical Engineering",
        "title": "Power Electronics", "code": "EEE705", "branch": "EEE", "sem": 6, "diff": "Advanced", "mins": 640,
        "short_desc": "Power semiconductors (MOSFET/IGBT/Thyristor), phase-controlled rectifiers, DC-DC buck/boost converters, and inverters.",
        "desc": "High-efficiency solid-state power conversion for renewable energy and electric vehicles. Study power semiconductor switches (SCR, MOSFET, IGBT), phase-controlled AC-DC rectifiers, switched-mode DC-DC converters (Buck, Boost, Buck-Boost), and pulse-width modulated (PWM) DC-AC inverters.",
        "skills": ["Power Semiconductor Switches (IGBT/MOSFET)", "Phase-Controlled Rectifiers", "Buck / Boost DC-DC Converters", "Continuous Conduction Mode (CCM)", "PWM Inverters", "Thermal Heat Sinks"],
        "prereqs": ["Electrical Circuit Analysis", "Analog Electronics"],
        "objectives": ["Compare switching losses, conduction losses, and safe operating areas (SOA) of power devices", "Analyze phase-controlled thyristor rectifiers across inductive and resistive loads", "Design DC-DC Buck, Boost, and Buck-Boost converters in Continuous Conduction Mode (CCM)", "Implement Sinusoidal Pulse Width Modulation (SPWM) for single-phase and three-phase inverters"],
        "thumb": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Power Semiconductor Devices & Switching Dynamics", "Solid-state switches capable of blocking kilovolts and conducting kiloamps.", [
                ("Power Diodes, Thyristors (SCR) & Triacs", "Two-transistor analogy of SCR, gate triggering, holding and latching currents.", "TEXT", "text"),
                ("Power MOSFETs vs Insulated Gate Bipolar Transistors (IGBT)", "MOSFET majority carrier conduction vs IGBT conductivity modulation, tail current.", "TEXT", "text"),
                ("Switching Losses & Thermal Heat Sink Calculations", "Turn-on/turn-off transition energy dissipation, thermal resistance junction-to-case.", "CODE", "python"),
            ]),
            ("Phase-Controlled AC-DC Converters (Rectifiers)", "Converting AC mains into variable DC voltage.", [
                ("Single-Phase Half-Wave & Full-Wave Controlled Rectifiers", "Firing angle alpha, output average voltage V_dc = (2 V_m / pi) cos(alpha).", "CODE", "python"),
                ("Three-Phase Fully-Controlled Bridge Converters", "6-pulse rectifier waveforms, line-to-line commutation, continuous/discontinuous modes.", "CODE", "python"),
                ("Inversion Mode & AC Line Commutation", "Operating with firing angle alpha > 90 degrees for regenerative power return to grid.", "TEXT", "text"),
            ]),
            ("Switched-Mode DC-DC Converters (Choppers)", "High-efficiency voltage stepping for EV powertrains and power supplies.", [
                ("The Buck (Step-Down) Converter in Continuous Conduction (CCM)", "Volt-second balance on inductor, capacitor charge balance, ripple voltage formula.", "CODE", "python"),
                ("The Boost (Step-Up) Converter Architecture", "V_out = V_in / (1 - D), duty cycle limits, right-half-plane zero dynamics.", "CODE", "python"),
                ("Buck-Boost & Cuk Converters", "Voltage inverting step-up/down capability, energy transfer inductor considerations.", "CODE", "python"),
            ]),
            ("DC-AC Inverters & Modulation Techniques", "Synthesizing clean AC sinusoidal power from DC battery banks.", [
                ("Single-Phase Full-Bridge Voltage Source Inverter (VSI)", "H-bridge transistor switching states, square-wave vs quasi-square wave output.", "CODE", "python"),
                ("Sinusoidal Pulse Width Modulation (SPWM)", "Triangular carrier wave vs reference sine wave, modulation index, harmonic spectrum.", "CODE", "python"),
                ("Three-Phase 180 and 120 Degree Conduction Inverters", "Space Vector PWM (SVPWM) overview, brushless DC and induction motor drives.", "CODE", "python"),
            ]),
        ]
    },
]

COURSES_I = [
    {
        "num": 86, "cat_key": "categoryI", "cat_name": "Mechanical and Civil Engineering",
        "title": "Engineering Mechanics", "code": "MEC801", "branch": "Mechanical", "sem": 2, "diff": "Beginner", "mins": 520,
        "short_desc": "Statics & dynamics: Force vectors, equilibrium equations, free-body diagrams, friction, and kinematics.",
        "desc": "The foundational physical principles of mechanical equilibrium and motion. Master vector resolution of forces, free-body diagrams (FBD), equilibrium equations in 2D and 3D, dry friction (Coulomb law), centroids, moments of inertia, and particle kinematics/kinetics.",
        "skills": ["Force Vector Equilibrium", "Free-Body Diagrams (FBD)", "Friction & Wedges", "Centroids & Moment of Inertia", "Particle Kinematics", "Work-Energy Theorem"],
        "prereqs": ["None - Open to all engineering students"],
        "objectives": ["Construct accurate Free-Body Diagrams (FBD) for structural assemblies", "Solve 2D and 3D equilibrium equations: sum F = 0 and sum M = 0", "Calculate centroids and area moments of inertia using the Parallel Axis Theorem", "Apply Newton's Second Law and Work-Energy principles to dynamic mechanical systems"],
        "thumb": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Statics of Particles & Rigid Bodies", "Static equilibrium under concurrent and non-concurrent force systems.", [
                ("Force Vectors, Resultants & Lami's Theorem", "Scalar components, unit vectors, dot and cross products in mechanics.", "CODE", "python"),
                ("Free-Body Diagrams (FBD) & Equilibrium Equations", "Support reactions (rollers, pins, fixed supports), sum F_x = 0, sum F_y = 0, sum M = 0.", "TEXT", "text"),
                ("Moments of a Force & Varignon's Theorem", "Moment arm perpendicular distance, vector cross product r x F, couples.", "CODE", "python"),
            ]),
            ("Friction & Mechanical Assemblies", "Resistive tangential forces and machines.", [
                ("Coulomb Dry Friction & Angles of Friction", "Static friction coefficient mu_s vs kinetic mu_k, angle of repose.", "CODE", "python"),
                ("Wedges, Belt Friction & Screw Threads", "Self-locking square threads, flat belt tension ratio T2/T1 = e^(mu*theta).", "CODE", "python"),
                ("Truss Analysis: Method of Joints & Method of Sections", "Zero-force members, axial tension and compression in structural trusses.", "CODE", "python"),
            ]),
            ("Centroids & Moments of Inertia", "Geometric distribution of mass and area.", [
                ("Centroids of Composite Areas & Curves", "First moments of area, integrating standard shapes (triangles, semicircles).", "CODE", "python"),
                ("Second Moment of Area (Area Moment of Inertia)", "Bending resistance, polar moment of inertia J, radius of gyration.", "CODE", "python"),
                ("Parallel Axis (Steiner's) Theorem", "Transferring moments of inertia: I = I_G + A*d^2 for composite beam cross-sections.", "CODE", "python"),
            ]),
            ("Kinematics & Kinetics of Particles", "Translational and rotational motion under applied forces.", [
                ("Rectilinear & Curvilinear Particle Kinematics", "Position, velocity, acceleration, normal and tangential coordinate systems.", "CODE", "python"),
                ("Newton's Second Law & D'Alembert's Principle", "Equations of motion sum F = m*a, dynamic equilibrium with inertia forces.", "CODE", "python"),
                ("Work-Energy Principle & Impulse-Momentum", "Work done by variable forces, conservation of mechanical energy, linear momentum.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 87, "cat_key": "categoryI", "cat_name": "Mechanical and Civil Engineering",
        "title": "Thermodynamics", "code": "MEC802", "branch": "Mechanical", "sem": 3, "diff": "Intermediate", "mins": 580,
        "short_desc": "First & Second Laws, Carnot cycle, entropy generation, pure substance properties, and Rankine/Brayton cycles.",
        "desc": "The fundamental science of energy conversion, heat, and work. Master thermodynamic systems and properties, the First Law energy conservation, Second Law entropy generation, Carnot efficiency limits, steam tables and Mollier diagrams, and ideal power cycles (Otto, Diesel, Rankine, Brayton).",
        "skills": ["First Law Energy Balance", "Second Law & Carnot Engine", "Entropy Generation & Irreversibility", "Steam Tables & Mollier Diagrams", "Rankine Power Cycle", "Brayton Gas Cycle"],
        "prereqs": ["Engineering Physics", "Engineering Mathematics"],
        "objectives": ["Apply the First Law of Thermodynamics to closed systems and open steady-flow devices", "Calculate maximum theoretical thermal efficiencies using the Carnot cycle formulation", "Evaluate entropy generation and exergy destruction in real non-ideal processes", "Analyze thermal power generation cycles: Rankine steam cycle and Brayton gas turbine"],
        "thumb": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Thermodynamic Concepts & The First Law", "Energy conservation in closed and open systems.", [
                ("Thermodynamic Systems, Properties & Zeroth Law", "Closed, open, isolated systems, intensive vs extensive properties, temperature.", "TEXT", "text"),
                ("First Law for Closed Systems: Q - W = Delta U", "Boundary work integral P dV for polytropic, isobaric, isochoric, isothermal paths.", "CODE", "python"),
                ("Steady Flow Energy Equation (SFEE) for Open Systems", "Enthalpy H = U + PV, mass flow rate, nozzles, turbines, compressors, throttles.", "CODE", "python"),
            ]),
            ("The Second Law & Entropy", "Directionality of natural processes and entropy generation.", [
                ("Kelvin-Planck & Clausius Statements of Second Law", "Heat engines, heat pumps, refrigerators, thermal efficiency and COP.", "TEXT", "text"),
                ("The Carnot Cycle & Carnot Principles", "Reversible isothermal and isentropic stages, maximum theoretical thermal efficiency.", "CODE", "python"),
                ("Clausius Inequality & Entropy Generation", "dS = dQ_rev / T, principle of entropy increase Delta S_universe >= 0.", "CODE", "python"),
            ]),
            ("Properties of Pure Substances", "Phase change behavior of water and refrigerants.", [
                ("Phase Change Regimes: P-v-T Surfaces & T-s Diagrams", "Compressed liquid, saturated mixture, superheated vapor, critical point.", "TEXT", "text"),
                ("Steam Tables & Dryness Fraction Calculations", "Using steam property tables, dryness fraction x, wet steam enthalpy/entropy.", "CODE", "python"),
                ("Ideal Gas Equations of State & Compressibility Factor Z", "P v = R T, van der Waals equation, generalized compressibility chart.", "CODE", "python"),
            ]),
            ("Vapor & Gas Power Cycles", "Converting heat into mechanical shaft work.", [
                ("The Rankine Vapor Power Cycle", "Boiler, turbine, condenser, pump stages, superheat and reheat improvements.", "CODE", "python"),
                ("The Brayton Cycle for Gas Turbines", "Isentropic compression, constant-pressure combustion, expansion, regenerators.", "CODE", "python"),
                ("Internal Combustion Cycles: Otto & Diesel Cycles", "Air-standard assumptions, compression ratio, thermal efficiency derivations.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 88, "cat_key": "categoryI", "cat_name": "Mechanical and Civil Engineering",
        "title": "Fluid Mechanics", "code": "MEC803", "branch": "Mechanical", "sem": 4, "diff": "Intermediate", "mins": 600,
        "short_desc": "Fluid statics (manometry/buoyancy), Bernoulli's equation, Navier-Stokes, pipe flow, and boundary layer theory.",
        "desc": "The behavior of liquids and gases at rest and in motion. Master fluid statics, pressure measurement, buoyancy and metacentric height, continuity and Bernoulli energy equations, momentum conservation, laminar vs turbulent pipe flow (Moody chart), and Prandtl boundary layer theory.",
        "skills": ["Fluid Statics & Manometry", "Buoyancy & Metacenter", "Bernoulli Energy Equation", "Navier-Stokes Equations", "Pipe Friction (Darcy-Weisbach)", "Boundary Layer Theory"],
        "prereqs": ["Engineering Mechanics", "Engineering Mathematics"],
        "objectives": ["Compute hydrostatic forces on submerged planar and curved surfaces", "Derive and apply Bernoulli's energy equation with head loss corrections", "Calculate major and minor friction losses in pressurized pipe networks using the Moody diagram", "Understand laminar-to-turbulent boundary layer transitions and drag forces"],
        "thumb": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Fluid Statics & Pressure Distribution", "Fluids in static equilibrium without shear stress.", [
                ("Fluid Properties: Viscosity, Surface Tension & Density", "Newton's law of viscosity tau = mu du/dy, kinematic vs dynamic viscosity.", "CODE", "python"),
                ("Hydrostatic Pressure & Manometer Equations", "dP/dz = -rho*g, Pascal's law, U-tube and differential manometers.", "CODE", "python"),
                ("Hydrostatic Forces on Submerged Surfaces & Buoyancy", "Center of pressure, Archimedes principle, metacentric height stability.", "CODE", "python"),
            ]),
            ("Fluid Kinematics & Continuity", "Describing fluid motion without forces.", [
                ("Lagrangian vs Eulerian Descriptions & Streamlines", "Pathlines, streaklines, streamlines, steady vs unsteady flow fields.", "TEXT", "text"),
                ("Differential Continuity Equation & Velocity Potential", "Conservation of mass del . (rho * V) = 0, stream function psi, irrotational flow.", "CODE", "python"),
                ("Fluid Acceleration: Local & Convective Acceleration", "Material derivative D/Dt = d/dt + (V . del), vorticity and circulation.", "TEXT", "text"),
            ]),
            ("Fluid Dynamics & Bernoulli's Equation", "Energy and momentum conservation in flowing fluids.", [
                ("Euler's Equation of Motion & Bernoulli's Theorem", "Integration along a streamline: P/gamma + V^2/(2g) + z = Constant.", "CODE", "python"),
                ("Flow Measurement: Venturi Meter, Orifice & Pitot Tube", "Coefficient of discharge C_d, stagnation pressure, flow rate equations.", "CODE", "python"),
                ("Linear Momentum Equation & Force on Bends", "Control volume momentum balance, hydrodynamic forces on pipe reducers and vanes.", "CODE", "python"),
            ]),
            ("Viscous Flow, Pipe Friction & Boundary Layers", "Internal and external real fluid flow.", [
                ("Laminar vs Turbulent Flow & Reynolds Number", "Critical Re = 2300 in pipes, Hagen-Poiseuille parabolic velocity profile.", "CODE", "python"),
                ("Pipe Friction: Darcy-Weisbach Equation & Moody Chart", "Head loss h_f = f * (L/D) * (V^2/2g), relative roughness, minor losses.", "CODE", "python"),
                ("Prandtl Boundary Layer Theory & Skin Friction Drag", "Boundary layer thickness delta(x), momentum thickness, separation and wake.", "TEXT", "text"),
            ]),
        ]
    },
    {
        "num": 89, "cat_key": "categoryI", "cat_name": "Mechanical and Civil Engineering",
        "title": "Strength of Materials", "code": "CIV804", "branch": "Civil", "sem": 3, "diff": "Intermediate", "mins": 620,
        "short_desc": "Stress & strain, Hooke's law, Mohr's circle, shear force & bending moment diagrams, torsion, and deflection.",
        "desc": "Mechanical behavior of solid structural members under external loading. Master stress and strain tensors, Hooke's Law, principal stresses via Mohr's Circle, Shear Force and Bending Moment Diagrams (SFD/BMD), flexural bending stress formula, shaft torsion, and Euler column buckling.",
        "skills": ["Stress-Strain Curves", "Mohr's Circle of Stress", "Shear Force & Bending Diagrams (SFD/BMD)", "Flexure Formula (Bending Stress)", "Torsion of Circular Shafts", "Euler Column Buckling"],
        "prereqs": ["Engineering Mechanics"],
        "objectives": ["Construct Shear Force and Bending Moment Diagrams for cantilever and simply supported beams", "Calculate principal stresses and maximum in-plane shear stress using Mohr's Circle", "Determine bending stresses and transverse shear stresses in structural cross-sections", "Compute critical buckling loads for slender columns using Euler's buckling theory"],
        "thumb": "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Simple Stresses, Strains & Elastic Constants", "Deformation of axial members under mechanical loads.", [
                ("Normal Stress, Shear Stress & Hooke's Law", "Stress-strain curve of mild steel, yield strength, ultimate strength, safety factor.", "CODE", "python"),
                ("Elastic Constants: Young's Modulus, Poisson's Ratio, Bulk Modulus", "Volumetric strain, relationships between E, G, K, and Poisson's ratio nu.", "CODE", "python"),
                ("Thermal Stresses & Composite Bars", "Constrained thermal expansion sigma = E * alpha * Delta T, equivalent sections.", "CODE", "python"),
            ]),
            ("Complex Stresses & Mohr's Circle", "Stress state transformations across arbitrary inclined planes.", [
                ("Stresses on Oblique Planes: Transformation Equations", "Normal stress sigma_theta and shear stress tau_theta on inclined cuts.", "CODE", "python"),
                ("Principal Stresses & Principal Planes", "Vanishing of shear stress on principal planes, maximum shear stress planes.", "CODE", "python"),
                ("Mohr's Circle Construction & Graphical Solution", "Center and radius formulas, determining principal stresses visually.", "CODE", "python"),
            ]),
            ("Shear Force & Bending Moment in Beams", "Internal loading distributions across structural spans.", [
                ("Relationships Between Distributed Load, Shear Force & Moment", "d V / dx = -w(x) and d M / dx = V(x), point of contraflexure.", "TEXT", "text"),
                ("SFD & BMD for Simply Supported & Overhanging Beams", "Point loads, uniformly distributed loads (UDL), and uniformly varying loads (UVL).", "CODE", "python"),
                ("The Pure Bending Theory & Flexure Formula", "sigma / y = M / I = E / R, section modulus Z, neutral axis location.", "CODE", "python"),
            ]),
            ("Torsion, Beam Deflection & Column Buckling", "Twisting, elastic curves, and structural stability.", [
                ("Torsion of Circular Shafts: Polar Modulus", "T / J = tau / r = G*theta / L, angle of twist, shear stress distribution.", "CODE", "python"),
                ("Beam Deflection: Double Integration & Macaulay's Method", "Differential equation of elastic curve E I d^2y/dx^2 = M(x), boundary conditions.", "CODE", "python"),
                ("Euler's Buckling Theory for Slender Columns", "P_cr = pi^2 * E * I / (L_eff)^2, effective length factors for different end conditions.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 90, "cat_key": "categoryI", "cat_name": "Mechanical and Civil Engineering",
        "title": "Engineering Drawing and CAD Fundamentals", "code": "CIV805", "branch": "Civil", "sem": 1, "diff": "Beginner", "mins": 500,
        "short_desc": "Orthographic projections, isometric views, sectioning, dimensioning standards, and 2D/3D CAD drafting.",
        "desc": "The universal graphical language of engineers. Master standard drawing conventions (BIS/ISO), first-angle and third-angle orthographic projections, isometric view projections, sectional views, geometric dimensioning and tolerancing (GD&T), and 2D/3D Computer-Aided Design (CAD).",
        "skills": ["Orthographic Projections", "Isometric Projections", "First vs Third Angle", "Sectional Views", "GD&T Dimensioning", "2D/3D CAD Modeling"],
        "prereqs": ["None - Open to all engineering students"],
        "objectives": ["Interpret and construct first-angle and third-angle orthographic projections", "Convert 2D multi-view drawings into 3D isometric graphical projections", "Apply standard ISO dimensioning, tolerances, and sectional cutting planes", "Create parametric geometric sketches and 3D solid models using CAD software"],
        "thumb": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Drawing Principles & Orthographic Projection", "Projecting three-dimensional objects onto orthogonal 2D planes.", [
                ("Drawing Standards, Scales & Line Types", "Continuous thick/thin, hidden lines, center lines, cutting-plane line styles.", "TEXT", "text"),
                ("First-Angle vs Third-Angle Projection Systems", "Observer, object, projection plane arrangements, standard projection symbols.", "TEXT", "text"),
                ("Orthographic Multi-View Generation: Front, Top & Side Views", "Projecting vertices, hidden features, and aligned multi-views.", "TEXT", "text"),
            ]),
            ("Projections of Points, Lines & Planes", "Spatial geometry fundamentals.", [
                ("Projection of Points in Four Quadrants", "Distance from Horizontal Plane (HP) and Vertical Plane (VP).", "TEXT", "text"),
                ("Projection of Straight Lines & True Length Determination", "Inclination with HP (theta) and VP (phi), apparent lengths, rotating line method.", "CODE", "python"),
                ("Projections of Regular Polygonal & Circular Planes", "Surface inclination, auxiliary planes, and apparent foreshortening.", "TEXT", "text"),
            ]),
            ("Isometric Projections & Sectioning", "Visualizing pictorial views and internal internal details.", [
                ("Isometric Scale & Isometric Views vs Isometric Projections", "30-degree isometric axes, true scale vs 0.816 isometric length foreshortening.", "TEXT", "text"),
                ("Isometric Views of Cylinders, Cones & Spheres", "Four-center ellipse approximation method for isometric circles.", "TEXT", "text"),
                ("Sectional Views: Full, Half, Revolved & Offset Sections", "Hatching angle (45 degrees), cutting plane lines, exposing internal geometries.", "TEXT", "text"),
            ]),
            ("Computer-Aided Design (CAD) & 3D Modeling", "Digital parametric engineering drafting.", [
                ("2D CAD Coordinate Systems & Precision Drafting", "Absolute, relative rectangular (@x,y), and relative polar (@r<theta) input.", "CODE", "text"),
                ("Parametric Constraints: Geometric & Dimensional", "Coincident, tangent, concentric, horizontal/vertical constraints in sketches.", "TEXT", "text"),
                ("3D Solid Modeling: Extrude, Revolve, Sweep & Loft", "Constructing 3D solid bodies from constrained 2D profiles, fillets, chamfers.", "TEXT", "text"),
            ]),
        ]
    },
]

COURSES_J = [
    {
        "num": 91, "cat_key": "categoryJ", "cat_name": "Mathematics, Aptitude, and Career Skills",
        "title": "Engineering Mathematics", "code": "MTH901", "branch": "Common", "sem": 1, "diff": "Beginner", "mins": 560,
        "short_desc": "Differential calculus, Taylor series, multiple integrals, vector calculus (Green/Gauss/Stokes), and ODEs.",
        "desc": "The foundational mathematical bedrock for all engineering disciplines. Master differential calculus of single and several variables, Taylor/Maclaurin series, double and triple integrals, vector differential operators (gradient, divergence, curl), and fundamental vector theorems (Green, Stokes, Gauss Divergence).",
        "skills": ["Differential Calculus", "Taylor & Maclaurin Series", "Multiple Integrals", "Vector Calculus (del/grad/curl)", "Gauss Divergence Theorem", "Ordinary Differential Equations"],
        "prereqs": ["High School Calculus & Algebra"],
        "objectives": ["Expand complex functions into convergent Taylor and Maclaurin power series", "Evaluate multiple double and triple integrals over Cartesian and polar coordinates", "Compute gradient, divergence, and curl of multidimensional vector fields", "Verify Green's, Stokes', and Gauss Divergence theorems for physical flux flows"],
        "thumb": "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Differential Calculus & Series Expansions", "Limits, derivatives, and polynomial approximations.", [
                ("Rolle's Theorem & Lagrange's Mean Value Theorem", "Geometric interpretations, differentiability requirements, and intermediate slopes.", "TEXT", "text"),
                ("Taylor & Maclaurin Series Expansions", "Power series approximations, remainder terms, and expanding sin(x), e^x, ln(1+x).", "CODE", "python"),
                ("Partial Differentiation & Euler's Theorem on Homogeneous Functions", "Mixed partial derivatives, degree of homogeneity, and total differentials.", "CODE", "python"),
            ]),
            ("Multiple Integrals & Coordinate Transformations", "Integrating volume and surface densities over spatial domains.", [
                ("Double Integrals: Evaluation & Order of Integration Reversal", "Setting integration limits over non-rectangular regions, Fubini's theorem.", "CODE", "python"),
                ("Change of Variables in Double Integrals: Polar Coordinates", "The Jacobian of transformation r dr dtheta and circular disc integration.", "CODE", "python"),
                ("Triple Integrals: Cylindrical & Spherical Coordinates", "Volume calculations, center of mass, and moment of inertia integrals.", "CODE", "python"),
            ]),
            ("Vector Differential Calculus", "Scalar and vector fields in three-dimensional space.", [
                ("Scalar Fields, Vector Fields & Directional Derivatives", "Gradient vector del f, normal vectors to surfaces, and rate of maximum increase.", "CODE", "python"),
                ("Divergence of a Vector Field & Physical Fluid Flux", "del . V operator, solenoidal vector fields, and source/sink characterization.", "CODE", "python"),
                ("Curl of a Vector Field & Irrotational Fields", "del x V operator, rotational vortex velocity, and conservative scalar potentials.", "CODE", "python"),
            ]),
            ("Vector Integral Theorems & Ordinary Differential Equations", "Boundary line integrals and surface flux connections.", [
                ("Line Integrals, Surface Integrals & Volume Integrals", "Work done along a curve, circulation, and mass flux through an enclosed surface.", "CODE", "python"),
                ("Green's Theorem & Stokes' Curl Theorem", "Relating circulation around a closed boundary to the curl over the bounded surface.", "CODE", "python"),
                ("Gauss Divergence Theorem & First-Order ODEs", "Converting closed surface flux to volume divergence, integrating factor method.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 92, "cat_key": "categoryJ", "cat_name": "Mathematics, Aptitude, and Career Skills",
        "title": "Discrete Mathematics", "code": "MTH902", "branch": "CSE", "sem": 3, "diff": "Intermediate", "mins": 580,
        "short_desc": "Set theory, predicate logic, mathematical induction, relations, graph theory, and combinatorics.",
        "desc": "The discrete mathematical structures underlying algorithms and computer software. Master propositional and predicate logic, proof techniques (direct, contradiction, strong induction), equivalence relations and partial orders (posets), generating functions, recurrence relations, and graph isomorphism.",
        "skills": ["Propositional Logic", "Proof Techniques & Induction", "Equivalence Relations & Posets", "Combinatorics & Pigeonhole", "Recurrence Relations", "Graph Isomorphism & Trees"],
        "prereqs": ["Engineering Mathematics"],
        "objectives": ["Prove mathematical assertions using direct proof, contradiction, and induction", "Analyze properties of binary relations: reflexivity, symmetry, transitivity, and equivalence", "Solve combinatorial counting problems using permutations, combinations, and the Pigeonhole Principle", "Apply graph theory concepts: Euler tours, Hamiltonian paths, and chromatic numbers"],
        "thumb": "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Logic, Quantifiers & Proof Methods", "Formal mathematical reasoning and proof structures.", [
                ("Propositional Logic, Truth Tables & Logical Equivalences", "Conjunction, disjunction, implications, biconditionals, tautologies, contradictions.", "TEXT", "text"),
                ("Predicate Calculus & First-Order Quantifiers (For All, Exists)", "Universal and existential quantification, nested quantifiers, negating predicates.", "TEXT", "text"),
                ("Proof Techniques: Direct, Contraposition, Contradiction, Induction", "Well-ordering principle, weak mathematical induction, strong induction.", "CODE", "python"),
            ]),
            ("Sets, Relations & Partial Orders", "Fundamental algebraic sets and ordered structures.", [
                ("Set Algebra, Power Sets & Cartesian Products", "Union, intersection, symmetric difference, complement, cardinality properties.", "TEXT", "text"),
                ("Binary Relations: Reflexive, Symmetric, Transitive Closures", "Warshall's algorithm for transitive closure, equivalence classes and partitions.", "CODE", "python"),
                ("Posets, Hasse Diagrams & Lattices", "Partial orders, upper/lower bounds, GLB, LUB, distributive and complemented lattices.", "TEXT", "text"),
            ]),
            ("Combinatorics & Recurrence Relations", "Counting discrete structures and recurrence solutions.", [
                ("Counting Principles: Product Rule, Sum Rule & Pigeonhole Principle", "Generalized Pigeonhole Principle, generalized permutations and combinations.", "CODE", "python"),
                ("Inclusion-Exclusion Principle & Derangements", "Counting union sizes across multiple overlapping sets, derangements formula !n.", "CODE", "python"),
                ("Solving Linear Recurrence Relations & Generating Functions", "Homogeneous vs non-homogeneous recurrences, characteristic roots.", "CODE", "python"),
            ]),
            ("Graph Theory & Tree Structures", "Network connectivity and discrete topology.", [
                ("Graph Terminology, Degree Handshaking Lemma & Isomorphism", "Simple graphs, adjacency/incidence matrices, testing graph isomorphism invariants.", "CODE", "python"),
                ("Eulerian Paths vs Hamiltonian Cycles", "Euler's theorem on even degrees, Dirac's and Ore's theorems for Hamiltonian graphs.", "CODE", "python"),
                ("Trees, Spanning Trees & Graph Coloring", "Tree properties, Cayley's formula n^(n-2), vertex coloring, Four Color Theorem.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 93, "cat_key": "categoryJ", "cat_name": "Mathematics, Aptitude, and Career Skills",
        "title": "Quantitative Aptitude", "code": "APT903", "branch": "Common", "sem": 5, "diff": "Beginner", "mins": 500,
        "short_desc": "Percentages, profit & loss, time & work, speed/distance/time, permutations, and data interpretation.",
        "desc": "Master quantitative problem-solving and mathematical aptitude required for campus recruitment drives, competitive examinations, and technical company placement assessments. Topics include percentages, profit/loss, simple/compound interest, time-and-work, speed-distance-time, and data interpretation.",
        "skills": ["Percentages & Ratios", "Profit, Loss & Discount", "Time & Work (Man-Hours)", "Speed, Distance & Relative Motion", "Permutations & Probability", "Data Interpretation (Charts)"],
        "prereqs": ["None - Open to all engineering students"],
        "objectives": ["Calculate percentages, ratio-proportions, and weighted averages rapidly with mental shortcuts", "Solve complex commercial math problems: profit-loss, successive discounts, CI/SI", "Formulate and solve time-and-work, pipes-and-cisterns, and worker efficiency problems", "Interpret complex business charts (pie charts, bar graphs, tables) with speed and accuracy"],
        "thumb": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Number Systems & Arithmetic Foundations", "Core numerical calculations and fractional proportions.", [
                ("Divisibility Rules, Prime Factorization, HCF & LCM", "Co-prime numbers, Euclidean algorithm for GCD, applications of LCM in cyclic events.", "CODE", "python"),
                ("Percentages, Fractional Equivalents & Successive Changes", "Fraction-to-percentage mental lookup (1/7 = 14.28%), net successive change formula.", "CODE", "python"),
                ("Ratios, Proportions & Alligation / Mixtures", "Mean proportional, compound ratios, rule of alligation for cost mixtures.", "CODE", "python"),
            ]),
            ("Commercial Mathematics & Interest Calculations", "Financial transactions and compounding returns.", [
                ("Profit, Loss, Markup & Successive Discounts", "Cost price, selling price, marked price, trade discounts, false weight tricks.", "CODE", "python"),
                ("Simple Interest & Compound Interest (Compounding Cycles)", "SI = PRT/100, CI = P(1 + r/n)^(nt), difference between CI and SI for 2 and 3 years.", "CODE", "python"),
                ("Averages, Mixtures & Weighted Averages", "Deviation method for fast average calculation, age-related arithmetic problems.", "CODE", "python"),
            ]),
            ("Time, Work, Speed & Relative Motion", "Rates of work and kinematic problem solving.", [
                ("Time & Work, Efficiency Ratios & Man-Days", "Unit work approach (LCM method), negative work, alternate-day work schedules.", "CODE", "python"),
                ("Pipes and Cisterns Problems", "Inlet filling rates vs outlet emptying leakage rates, simultaneous pipe operation.", "CODE", "python"),
                ("Speed, Distance, Time & Relative Speed", "Average speed harmonic mean, trains passing platforms/poles, boats and streams.", "CODE", "python"),
            ]),
            ("Combinatorics, Probability & Data Interpretation", "Statistical reasoning and chart decoding under timed conditions.", [
                ("Permutations & Combinations in Placement Tests", "Arranging letters with repetitions, seating in circles, selecting committees.", "CODE", "python"),
                ("Probability: Coins, Dice, Cards & Independent Events", "Sample spaces, mutually exclusive events, conditional probability basics.", "CODE", "python"),
                ("Data Interpretation: Tables, Bar Graphs & Pie Charts", "Degree-to-percentage conversion in pie charts, rapid calculation shortcuts.", "CODE", "python"),
            ]),
        ]
    },
    {
        "num": 94, "cat_key": "categoryJ", "cat_name": "Mathematics, Aptitude, and Career Skills",
        "title": "Logical Reasoning", "code": "APT904", "branch": "Common", "sem": 5, "diff": "Beginner", "mins": 500,
        "short_desc": "Deductive logic: Syllogisms, blood relations, seating arrangements, coding-decoding, and puzzle solving.",
        "desc": "Enhance analytical reasoning, structured deduction, and logical problem-solving abilities. Master Venn diagram syllogisms, linear and circular seating arrangements, family blood relations, direction sense, coding-decoding, series completion, and analytical puzzles.",
        "skills": ["Syllogisms (Venn Diagrams)", "Circular & Linear Seating", "Blood Relations & Family Trees", "Direction Sense Tests", "Coding-Decoding", "Critical Thinking & Deduction"],
        "prereqs": ["None - Open to all engineering students"],
        "objectives": ["Deduce valid conclusions from premise statements using Venn diagram syllogisms", "Solve complex multi-variable linear and circular seating arrangement constraints", "Construct genealogical family trees to resolve multi-generation blood relation queries", "Decode cryptographic cipher patterns, alphanumeric series, and spatial direction paths"],
        "thumb": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Deductive Logic & Syllogisms", "Evaluating formal truth and categorical propositions.", [
                ("Categorical Propositions: Universal & Particular Statements", "All A are B, No A is B, Some A are B, Some A are not B representations.", "TEXT", "text"),
                ("Syllogisms: Venn Diagram Representation Method", "Testing definite conclusions vs possibility conclusions, 'Either-Or' conditions.", "CODE", "python"),
                ("Statement & Assumptions vs Statement & Conclusions", "Evaluating implicit assumptions, distinguishing valid deductions from unwarranted jumps.", "TEXT", "text"),
            ]),
            ("Arrangements & Sequencing Puzzles", "Ordering elements under strict combinatorial constraints.", [
                ("Linear Seating Arrangements (Unidirectional & Bidirectional)", "Facing North vs facing South, absolute vs relative positions, end conditions.", "CODE", "python"),
                ("Circular & Polygonal Seating Arrangements", "Facing center vs facing outward, alternating positions, blood relations integration.", "CODE", "python"),
                ("Multi-Attribute Scheduling & Floor Puzzles", "Matching persons, professions, cities, and building floors using elimination grids.", "CODE", "python"),
            ]),
            ("Relational & Spatial Reasoning", "Kinship networks and physical coordinate navigation.", [
                ("Blood Relations: Family Tree Construction", "Standard genealogical symbols, generational levels, deciphering coded relations (A+B).", "TEXT", "text"),
                ("Direction Sense Tests & Pythagoras Distance", "Cardinal and intercardinal compass directions, shadow orientation at sunrise/sunset.", "CODE", "python"),
                ("Order & Ranking Calculations", "Finding total persons from left/right positions, overlapping rank swaps.", "CODE", "python"),
            ]),
            ("Coding-Decoding & Series Patterns", "Recognizing abstract alphanumeric and symbolic transformations.", [
                ("Letter Coding, Number Coding & Substitution", "Alphabet position values (A=1, Z=26), reverse values (A=26), shift patterns.", "CODE", "python"),
                ("Number Series, Letter Series & Analogies", "Arithmetic differences, geometric progressions, alternating Fibonacci sequences.", "CODE", "python"),
                ("Data Sufficiency: Evaluating Constraint Completeness", "Determining whether Statement 1, Statement 2, or both are sufficient to answer.", "TEXT", "text"),
            ]),
        ]
    },
    {
        "num": 95, "cat_key": "categoryJ", "cat_name": "Mathematics, Aptitude, and Career Skills",
        "title": "Verbal Ability and Communication", "code": "APT905", "branch": "Common", "sem": 4, "diff": "Beginner", "mins": 480,
        "short_desc": "Reading comprehension, sentence correction, vocabulary in context, critical reasoning, and para-jumbles.",
        "desc": "Master English language proficiency and professional verbal communication for campus placements, technical presentations, and corporate readiness. Covers reading comprehension strategies, grammatical sentence correction (subject-verb agreement, modifiers), vocabulary contextualization, and para-jumbles.",
        "skills": ["Reading Comprehension", "Grammar & Sentence Correction", "Subject-Verb Agreement", "Vocabulary in Context", "Para-Jumbles", "Business Communication"],
        "prereqs": ["None - Open to all engineering students"],
        "objectives": ["Extract central themes, tone, and inferences rapidly from dense reading passages", "Identify and correct grammatical errors: subject-verb agreement, dangling modifiers, tenses", "Reconstruct disordered paragraphs into coherent narrative paragraphs (Para-Jumbles)", "Author clear, concise, and professional business emails and executive memos"],
        "thumb": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Reading Comprehension & Critical Analysis", "Deconstructing dense analytical texts quickly.", [
                ("Passage Reading Strategies: Skimming, Scanning & Active Reading", "Identifying the thesis statement, topic sentences, and structural transitions.", "TEXT", "text"),
                ("Question Types: Main Idea, Inference, Tone & Specific Detail", "Avoiding extreme choices, finding textual evidence for implicit deductions.", "TEXT", "text"),
                ("Critical Reasoning: Strengthening & Weakening Arguments", "Identifying premises, conclusion, assumptions, and logical fallacies in text.", "TEXT", "text"),
            ]),
            ("Grammar Foundations & Error Detection", "High-frequency grammatical rules tested in technical recruitment.", [
                ("Subject-Verb Agreement & Collective Nouns", "Intervening prepositional phrases, compound subjects with or/nor, indefinite pronouns.", "TEXT", "text"),
                ("Modifiers: Misplaced Modifiers & Dangling Participles", "Ensuring participial phrases correctly modify the immediate adjacent noun.", "TEXT", "text"),
                ("Parallelism & Idiomatic Preposition Usage", "Grammatical balance in coordinating conjunctions, lists, and comparisons.", "TEXT", "text"),
            ]),
            ("Vocabulary & Text Coherence", "Building contextual word mastery and paragraph structure.", [
                ("Contextual Vocabulary & Word Roots (Etymology)", "Latin and Greek roots (bene, mal, chrono, tele), connotations, and tone.", "TEXT", "text"),
                ("Sentence Completion & Double Fillers", "Clue words, contrast signals (however, although), cause-and-effect transitions.", "TEXT", "text"),
                ("Para-Jumbles (Sentence Rearrangement)", "Identifying mandatory pairs, opening sentences, pronoun antecedents, chronology.", "TEXT", "text"),
            ]),
            ("Professional & Technical Communication", "Corporate speaking and written communication standards.", [
                ("Professional Email Writing & Business Etiquette", "Subject lines, clear requests, polite tone, avoiding passive-aggressive phrasing.", "TEXT", "text"),
                ("Technical Presentation Skills & Slide Design", "Structuring technical talks: 10/20/30 rule, audience engagement, handling Q&A.", "TEXT", "text"),
                ("Active Listening & Cross-Cultural Team Dynamics", "Non-verbal cues, paraphrasing for confirmation, constructive feedback models.", "TEXT", "text"),
            ]),
        ]
    },
    {
        "num": 96, "cat_key": "categoryJ", "cat_name": "Mathematics, Aptitude, and Career Skills",
        "title": "Technical Interview Preparation", "code": "CAR906", "branch": "Common", "sem": 7, "diff": "Advanced", "mins": 600,
        "short_desc": "Technical interview mastery: Live coding, explaining thought processes, behavioral STAR method, and live Q&A.",
        "desc": "A dedicated preparation course for cracking software engineering technical interviews at leading tech companies and tier-1 enterprises. Master live problem breakdown, think-aloud strategies, dry running code on whiteboards, handling hints, behavioral STAR responses, and reverse interview questions.",
        "skills": ["Live Coding Interviews", "Think-Aloud Protocol", "Whiteboard Problem Solving", "Behavioral STAR Method", "Complexity Analysis On-The-Fly", "Handling Interviewer Hints"],
        "prereqs": ["Data Structures Fundamentals", "Algorithms and Problem Solving"],
        "objectives": ["Articulate algorithmic thought processes clearly in live technical interviews using the Think-Aloud protocol", "Structure behavioral and leadership interview answers using the STAR (Situation, Task, Action, Result) method", "Trace and dry-run code systematically with edge cases before presenting to interviewers", "Respond adaptively to interviewer hints and optimize code incrementally"],
        "thumb": "https://images.unsplash.com/photo-1516116211227-bbc0c25a07c3?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Technical Interview Framework & Communication", "Navigating the 45-minute live technical coding loop.", [
                ("The Anatomy of a Technical Interview (45-Minute Breakdown)", "5m intro, 30m problem solving, 5m questions, evaluation rubrics.", "TEXT", "text"),
                ("The UMPIRE Method: Understand, Match, Plan, Implement, Review, Evaluate", "Asking clarifying questions, specifying constraints, and stating assumptions.", "TEXT", "text"),
                ("The 'Think-Aloud' Protocol & Avoiding Dead Air", "Communicating mental model, explaining trade-offs, and collaborating with interviewers.", "TEXT", "text"),
            ]),
            ("Live Problem Decomposition & Optimization", "Progressing from brute-force to optimal solutions.", [
                ("Developing Brute-Force Baselines & Time Bounds", "Establishing working baseline O(n^2) before attempting complex optimizations.", "CODE", "cpp"),
                ("Pattern Matching: Two Pointers, Sliding Window, Monotonic Stack", "Recognizing problem triggers and selecting optimal algorithmic templates.", "CODE", "cpp"),
                ("Dry-Running & Edge Case Verification", "Hand-tracing execution on small inputs, testing empty/single/duplicate inputs.", "CODE", "cpp"),
            ]),
            ("Behavioral & Leadership Competencies (STAR)", "Passing culture, leadership, and collaboration evaluations.", [
                ("The STAR Method: Situation, Task, Action, Result", "Quantifying impact with metrics, emphasizing individual contributions ('I' vs 'we').", "TEXT", "text"),
                ("Handling Failure, Conflict & Technical Disagreements", "Reframing setbacks as learning experiences, resolving team architectural debates.", "TEXT", "text"),
                ("Leadership Principles & Company Values Alignment", "Ownership, customer obsession, bias for action, and delivering results.", "TEXT", "text"),
            ]),
            ("System Design & Architecture Round Basics", "Handling junior and mid-level architecture interviews.", [
                ("Scope & Scale Estimation (Back of the Envelope)", "Estimating QPS, storage bandwidth, read/write ratios, and memory capacity.", "CODE", "python"),
                ("High-Level Architecture Diagrams & Component Blocks", "Client, Load Balancer, Web Tier, Database, Cache, Message Queue.", "TEXT", "text"),
                ("Asking Great Reverse Questions to Interviewers", "Inquiring about engineering culture, deployment frequency, on-call health.", "TEXT", "text"),
            ]),
        ]
    },
    {
        "num": 97, "cat_key": "categoryJ", "cat_name": "Mathematics, Aptitude, and Career Skills",
        "title": "Data Structures and Algorithms Interview Practice", "code": "CAR907", "branch": "CSE", "sem": 6, "diff": "Advanced", "mins": 720,
        "short_desc": "High-frequency DSA patterns: Two Pointers, Sliding Window, Fast/Slow, Top-K, Intervals, and Graph Traversals.",
        "desc": "Intensive pattern-based coding practice targeting FAANG and product-based software engineering interviews. Master the 14 core coding patterns: Two Pointers, Sliding Window, Fast and Slow Pointers, Merge Intervals, Cyclic Sort, In-Place Reversal, Top-K Elements, and Topological Sort.",
        "skills": ["Two Pointers Pattern", "Sliding Window Pattern", "Fast & Slow Pointers", "Merge Intervals", "Top-K Heap Elements", "Topological Sort (Kahn)"],
        "prereqs": ["Data Structures Fundamentals", "Algorithms and Problem Solving"],
        "objectives": ["Identify the underlying algorithmic pattern behind unfamiliar coding interview questions", "Implement optimal two-pointer and sliding-window solutions in O(N) linear time", "Solve interval overlap and scheduling challenges using sorting and greedy merging", "Find kth smallest and most frequent elements efficiently using Min/Max Heaps in O(N log K)"],
        "thumb": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Two Pointers & Sliding Window Patterns", "Linear array traversal patterns with constant extra memory.", [
                ("The Two Pointers Pattern: Opposing & Converging Pointers", "Sorted two-sum, three-sum, container with most water, Dutch national flag.", "CODE", "cpp"),
                ("The Sliding Window Pattern: Fixed & Dynamic Windows", "Maximum sum subarray, longest substring without repeating characters.", "CODE", "cpp"),
                ("Fast & Slow Pointers (Tortoise and Hare)", "Linked list cycle detection, start of cycle, happy number, middle node finding.", "CODE", "cpp"),
            ]),
            ("Intervals, In-Place Reversal & Cyclic Sort", "Array transformations and index-based memory tricks.", [
                ("Merge Intervals & Interval Intersections", "Sorting by start time, overlapping interval mergers, insert interval.", "CODE", "cpp"),
                ("In-Place Reversal of a Linked List", "Iterative pointer swapping, reversing sub-lists between indices [m, n].", "CODE", "cpp"),
                ("Cyclic Sort: Arrays with Values from 1 to N", "O(N) time and O(1) space finding missing numbers, duplicate numbers.", "CODE", "cpp"),
            ]),
            ("Tree & Graph Traversal Patterns", "Hierarchical and network state exploration.", [
                ("Tree Breadth-First Search: Level-by-Level Traversal", "Queue-based level order, zigzag traversal, right side view, minimum depth.", "CODE", "cpp"),
                ("Tree Depth-First Search: Path Sums & Root-to-Leaf", "Path sum verification, binary tree maximum path sum, serializing trees.", "CODE", "cpp"),
                ("Topological Sort: Directed Acyclic Graphs (Kahn's Algorithm)", "In-degree array, queue processing, course schedule dependencies, alien dictionary.", "CODE", "cpp"),
            ]),
            ("Heaps, Binary Search & Dynamic Programming Patterns", "Logarithmic lookups and state-transition memoization.", [
                ("Top-K Elements Pattern using Min/Max Heaps", "Kth largest element in array, top-k frequent elements, median from data stream.", "CODE", "cpp"),
                ("Modified Binary Search: Rotated & Infinite Arrays", "Searching in rotated sorted arrays, finding peak elements, binary search on answer.", "CODE", "cpp"),
                ("0/1 Knapsack & Longest Increasing Subsequence Patterns", "Memoization table formulation, binary search patient sorting for LIS in O(N log N).", "CODE", "cpp"),
            ]),
        ]
    },
    {
        "num": 98, "cat_key": "categoryJ", "cat_name": "Mathematics, Aptitude, and Career Skills",
        "title": "Resume and Portfolio Development", "code": "CAR908", "branch": "Common", "sem": 6, "diff": "Beginner", "mins": 460,
        "short_desc": "ATS-friendly resumes, action verbs, project storytelling, GitHub portfolios, and LinkedIn optimization.",
        "desc": "Build a standout engineering portfolio and Applicant Tracking System (ATS) optimized resume that secures interviews. Learn the XYZ resume bullet formula ('Accomplished [X] as measured by [Y] by doing [Z]'), GitHub project readme documentation, live demo deployments, and LinkedIn professional branding.",
        "skills": ["ATS-Optimized Resumes", "XYZ Formula Bullets", "GitHub Portfolio Design", "Technical Project Readmes", "LinkedIn Optimization", "Personal Branding"],
        "prereqs": ["None - Open to all engineering students"],
        "objectives": ["Craft a single-page ATS-compliant engineering resume using clear typography and clean hierarchy", "Write compelling impact-focused experience bullets using Google's XYZ formula", "Design impressive GitHub project repositories with architecture diagrams and live demos", "Optimize LinkedIn profiles for recruiter search algorithms and outbound outreach"],
        "thumb": "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("ATS Architecture & Resume Formatting", "Passing initial automated recruitment filters.", [
                ("How Applicant Tracking Systems (ATS) Parse Resumes", "Plain text parsing, keyword indexing, font standards, avoiding graphics/tables.", "TEXT", "text"),
                ("Single-Page Engineering Resume Anatomy", "Header, Education, Technical Skills, Projects, Experience, Achievements hierarchy.", "TEXT", "text"),
                ("Technical Skills Taxonomy & Formatting", "Languages, Frameworks, Developer Tools, Databases, avoiding arbitrary skill bars.", "TEXT", "text"),
            ]),
            ("Writing High-Impact Project & Experience Bullets", "Quantifying engineering achievements convincingly.", [
                ("Google's XYZ Bullet Formula", "'Accomplished [X] as measured by [Y] by doing [Z]', active action verbs.", "TEXT", "text"),
                ("Quantifying Impact: Latency, Throughput, Accuracy & Cost", "Turning vague statements into compelling, metric-driven engineering bullets.", "TEXT", "text"),
                ("Highlighting Problem, Solution & Technologies in Projects", "Deconstructing complex capstone and hackathon projects into concise summaries.", "TEXT", "text"),
            ]),
            ("GitHub Portfolio & Project Documentation", "Showcasing code craftsmanship publicly.", [
                ("GitHub Profile README Customization", "Markdown profile layout, pinned repositories, tech stack badges, activity graphs.", "CODE", "markdown"),
                ("Writing Stellar Project READMEs", "System architecture diagrams (Mermaid), installation steps, API docs, live demo URLs.", "CODE", "markdown"),
                ("Deploying Free Live Prototypes (Vercel, Render, Fly.io)", "Deploying full-stack projects online so recruiters can test real working apps.", "CODE", "bash"),
            ]),
            ("LinkedIn Optimization & Networking Outreach", "Attracting inbound opportunities and networking effectively.", [
                ("LinkedIn Profile Optimization for Tech Recruiters", "SEO headline, 'About' narrative hook, feature section, licenses/certifications.", "TEXT", "text"),
                ("Cold Outreach & Informational Interview Messaging", "Reaching out to alumni and engineers respectfully with customized connection notes.", "TEXT", "text"),
                ("Technical Blogging & Online Presence", "Writing engineering breakdown articles on Hashnode/Dev.to to demonstrate deep mastery.", "TEXT", "text"),
            ]),
        ]
    },
    {
        "num": 99, "cat_key": "categoryJ", "cat_name": "Mathematics, Aptitude, and Career Skills",
        "title": "Group Discussion and HR Interview Skills", "code": "CAR909", "branch": "Common", "sem": 7, "diff": "Beginner", "mins": 460,
        "short_desc": "Group discussion strategies: Initiating, summarizing, moderating, body language, and HR interview questions.",
        "desc": "Excel in campus recruitment elimination rounds and final HR interviews. Master group discussion (GD) dynamics (initiating constructively, entering conversations gracefully, summarizing consensus), voice modulation, handling controversial topics, and answering classic HR questions with confidence.",
        "skills": ["Group Discussion Strategies", "Constructive Interventions", "Summarizing Consensus", "Body Language & Eye Contact", "HR Question Mastery", "Salary Negotiation Basics"],
        "prereqs": ["Verbal Ability and Communication"],
        "objectives": ["Initiate and conclude group discussions effectively using quotes, definitions, and balanced summaries", "Enter ongoing group conversations politely without shouting using bridge phrases", "Answer difficult HR questions ('Tell me about yourself', 'Why our company?') convincingly", "Demonstrate professional executive presence, active listening, and positive body language"],
        "thumb": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Group Discussion (GD) Framework & Roles", "Understanding recruitment evaluation criteria.", [
                ("GD Evaluation Parameters: Content, Communication, Leadership", "Knowledge depth, logical reasoning, listening habits, team collaboration.", "TEXT", "text"),
                ("Types of GD Topics: Factual, Controversial & Abstract", "Structuring arguments for social/economic issues, tech debates, abstract topics.", "TEXT", "text"),
                ("Roles in a GD: The Initiator, Contributor, Moderator, Summarizer", "Pros and cons of opening a GD, steering discussions back to the main topic.", "TEXT", "text"),
            ]),
            ("Discussion Techniques & Interpersonal Dynamics", "Assertive and polite participation in fast-paced debates.", [
                ("Entering the Discussion: Bridge Phrases & Timing", "'I agree with my friend and would like to add...', polite disagreement tactics.", "TEXT", "text"),
                ("Managing Conflict & Handling Aggressive Participants", "Staying calm, de-escalating shouting matches, including quiet participants.", "TEXT", "text"),
                ("Summarizing the GD: Balanced Conclusions", "Capturing pros and cons, consensus points, and delivering unbiased summaries.", "TEXT", "text"),
            ]),
            ("HR Interview Preparation & Classic Questions", "Passing the final cultural fit and organizational interview.", [
                ("'Tell Me About Yourself': The Present-Past-Future Formula", "Crafting a compelling 90-second professional elevator pitch.", "TEXT", "text"),
                ("Navigating Strengths & Weaknesses Honestly", "Authentic weaknesses with active improvement steps, avoid cliché answers.", "TEXT", "text"),
                ("'Why This Company?' & Organizational Research", "Referencing company mission, recent engineering blogs, products, and culture.", "TEXT", "text"),
            ]),
            ("Professional Presence & Negotiation Basics", "Executive presentation and offer discussions.", [
                ("Body Language, Eye Contact & Virtual Interview Etiquette", "Posture, hand gestures, framing on camera, lighting, audio clarity.", "TEXT", "text"),
                ("Long-Term Career Vision & Relocation/Shift Questions", "Demonstrating career ambition while showing organizational commitment.", "TEXT", "text"),
                ("Salary Expectations & Compensation Negotiation", "Market research, range phrasing, evaluating benefits, equity, and signing bonuses.", "TEXT", "text"),
            ]),
        ]
    },
    {
        "num": 100, "cat_key": "categoryJ", "cat_name": "Mathematics, Aptitude, and Career Skills",
        "title": "Software Project Management and Teamwork", "code": "CAR910", "branch": "Common", "sem": 7, "diff": "Intermediate", "mins": 540,
        "short_desc": "Engineering management: Project estimation, Jira/Linear, risk management, code review culture, and team leadership.",
        "desc": "Lead and collaborate effectively within modern cross-functional engineering teams. Master sprint planning, Jira and Linear issue tracking, task breakdown, critical path method (CPM), technical risk mitigation, constructive code review culture, and engineering leadership.",
        "skills": ["Project Estimation (Story Points)", "Issue Tracking (Jira / Linear)", "Critical Path Method (CPM)", "Technical Risk Management", "Code Review Culture", "Engineering Leadership"],
        "prereqs": ["Software Engineering"],
        "objectives": ["Break complex engineering epics down into estimated, actionable development issues", "Calculate project schedules and critical bottlenecks using the Critical Path Method (CPM)", "Conduct constructive, respectful code reviews that foster high engineering standards", "Identify and mitigate technical and operational project risks before they cause delays"],
        "thumb": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
        "modules": [
            ("Project Scheduling & Critical Path Method", "Planning and tracking multi-month engineering deliverables.", [
                ("Work Breakdown Structure (WBS) & Task Decomposition", "Hierarchical task breakdown from product epics to individual sub-tasks.", "TEXT", "text"),
                ("Critical Path Method (CPM) & PERT Analysis", "Earliest start/finish, latest start/finish, slack time, and critical path bottlenecks.", "CODE", "python"),
                ("Gantt Charts & Milestone Tracking", "Visualizing parallel work streams, dependencies, and delivery milestones.", "TEXT", "text"),
            ]),
            ("Issue Tracking & Modern Project Tools", "Day-to-day workflow tracking with Jira and Linear.", [
                ("Managing Backlogs with Jira & Linear", "Epics, stories, bugs, spikes, sprint backlogs, and board columns.", "TEXT", "text"),
                ("Sprint Cadences & Velocity Tracking", "Commitment vs completion velocity, burn-up and burn-down charts.", "TEXT", "text"),
                ("Triage Workflows & Severity Prioritization", "P0/P1/P2/P3 incident severities, bug triage matrices, and SLA timelines.", "TEXT", "text"),
            ]),
            ("Code Review Culture & Engineering Standards", "Maintaining high collective code quality through peer feedback.", [
                ("The Purpose of Code Reviews: Correctness, Readability, Architecture", "Finding bugs early, knowledge sharing, and maintaining architectural consistency.", "TEXT", "text"),
                ("Authoring Great Pull Requests & Writing Effective Review Comments", "Keeping PRs small (<400 lines), nitpicks vs blocking issues, empathetic phrasing.", "TEXT", "text"),
                ("Automated Linters, Formatting & Pre-Commit Hooks", "Enforcing style with Prettier and ESLint automatically to avoid review bike-shedding.", "CODE", "yaml"),
            ]),
            ("Risk Management, Blameless Postmortems & Leadership", "Organizational resilience and learning from engineering failure.", [
                ("Technical Risk Assessment Matrices", "Probability vs Impact scoring, risk avoidance, mitigation, and contingency plans.", "TEXT", "text"),
                ("The Blameless Postmortem Culture", "Root cause analysis (5 Whys), timeline of events, preventative action items.", "TEXT", "text"),
                ("Engineering Leadership & 1-on-1 Mentorship", "Technical mentorship, psychological safety, and empowering team members.", "TEXT", "text"),
            ]),
        ]
    },
]

print(f"Loaded {len(COURSES_G)} Category G courses, {len(COURSES_H)} Category H courses, {len(COURSES_I)} Category I courses, and {len(COURSES_J)} Category J courses.")
