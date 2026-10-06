// 스마트 해썹 마트 & 조리 과학 마스터 - 게임 메인 오케스트레이터

class SmartMartMasterGame {
    constructor() {
        this.studentName = "스마트학생";
        this.currentStage = 0; // 0: Intro, 1..7: Stages, 8: Receipt/Cert
        this.score = 0;
        this.combo = 0;
        this.stageScores = {
            stage1: 0,
            stage2: 0,
            stage3: 0,
            stage4: 0,
            stage5: 0,
            stage6: 0,
            stage7: 0
        };

        // Stage 1 (해썹 마트 장보기)
        this.currentOrderStep = 1;
        this.packedItems = [];

        // Stage 2 (식재료 감별)
        this.inspectorIndex = 0;
        this.inspectorList = [];

        // Stage 3 (인증 마크)
        this.certIndex = 0;
        this.certList = [];

        // Stage 4 (정육점)
        this.chefOrderIndex = 0;
        this.chefOrders = [];
        this.meatMap = null;

        // Stage 5 & 6 (조리 과학 랩 & 요리 시뮬레이터)
        this.cookingScience = null;

        // Stage 7 (골든벨)
        this.goldenBellIndex = 0;
        this.goldenBellQuestions = [];

        this.initDOM();
        this.bindGlobalEvents();
        this.cookingScience = new window.CookingScienceController(this);
    }

    initDOM() {
        this.el = {
            scoreDisplay: document.getElementById('scoreDisplay'),
            btnCheatSheet: document.getElementById('btnCheatSheet'),
            btnSoundToggle: document.getElementById('btnSoundToggle'),
            soundIcon: document.getElementById('soundIcon'),
            progressSection: document.getElementById('progressSection'),
            progressBarFill: document.getElementById('progressBarFill'),

            // Views
            viewIntro: document.getElementById('view-intro'),
            viewStage1: document.getElementById('view-stage1'),
            viewStage2: document.getElementById('view-stage2'),
            viewStage3: document.getElementById('view-stage3'),
            viewStage4: document.getElementById('view-stage4'),
            viewStage5: document.getElementById('view-stage5'),
            viewStage6: document.getElementById('view-stage6'),
            viewStage7: document.getElementById('view-stage7'),
            viewReceipt: document.getElementById('view-receipt'),

            // Modals
            feedbackModal: document.getElementById('feedbackModal'),
            feedbackIcon: document.getElementById('feedbackIcon'),
            feedbackTitle: document.getElementById('feedbackTitle'),
            feedbackDesc: document.getElementById('feedbackDesc'),
            feedbackNextBtn: document.getElementById('feedbackNextBtn'),

            cheatSheetModal: document.getElementById('cheatSheetModal'),
            btnCloseCheat: document.getElementById('btnCloseCheat'),
            cheatSheetList: document.getElementById('cheatSheetList'),

            // Intro
            studentNameInput: document.getElementById('studentNameInput'),
            btnStartGame: document.getElementById('btnStartGame'),

            // Stage 1 (해썹 마트)
            stage1Counter: document.getElementById('stage1Counter'),
            targetCategoryName: document.getElementById('targetCategoryName'),
            targetCategoryDesc: document.getElementById('targetCategoryDesc'),
            orderPillsContainer: document.getElementById('orderPillsContainer'),
            shelfItemsGrid: document.getElementById('shelfItemsGrid'),
            cartItemsRow: document.getElementById('cartItemsRow'),
            cartCount: document.getElementById('cartCount'),

            // Stage 2 (식재료 감별)
            stage2Progress: document.getElementById('stage2Progress'),
            inspectorFoodTitle: document.getElementById('inspectorFoodTitle'),
            inspectorQuestion: document.getElementById('inspectorQuestion'),
            inspectorOptionsContainer: document.getElementById('inspectorOptionsContainer'),
            inspectorTipText: document.getElementById('inspectorTipText'),

            // Stage 3 (인증 마크)
            stage3Progress: document.getElementById('stage3Progress'),
            certQuizClue: document.getElementById('certQuizClue'),
            certBadgesGrid: document.getElementById('certBadgesGrid'),

            // Stage 4 (정육점)
            stage4Progress: document.getElementById('stage4Progress'),
            chefDishTitle: document.getElementById('chefDishTitle'),
            chefOrderClue: document.getElementById('chefOrderClue'),
            meatMapContainer: document.getElementById('meatMapContainer'),

            // Stage 5 (조리 과학 랩 버튼)
            btnLabPhysical: document.getElementById('btnLabPhysical'),
            btnLabChemical: document.getElementById('btnLabChemical'),

            // Stage 7 (골든벨)
            stage7Progress: document.getElementById('stage7Progress'),
            goldenQuestionText: document.getElementById('goldenQuestionText'),
            goldenChoicesGrid: document.getElementById('goldenChoicesGrid'),

            // Receipt & Certificate
            receiptRankTitle: document.getElementById('receiptRankTitle'),
            receiptDate: document.getElementById('receiptDate'),
            receiptCustomer: document.getElementById('receiptCustomer'),
            resStage1: document.getElementById('resStage1'),
            resStage2: document.getElementById('resStage2'),
            resStage3: document.getElementById('resStage3'),
            resStage4: document.getElementById('resStage4'),
            resStage5: document.getElementById('resStage5'),
            resStage6: document.getElementById('resStage6'),
            resStage7: document.getElementById('resStage7'),
            receiptTotalScore: document.getElementById('receiptTotalScore'),
            certStudentName: document.getElementById('certStudentName'),
            certScoreBadge: document.getElementById('certScoreBadge'),
            btnRestartGame: document.getElementById('btnRestartGame'),
            btnPrintReceipt: document.getElementById('btnPrintReceipt')
        };
    }

    bindGlobalEvents() {
        // 게임 시작
        if (this.el.btnStartGame) {
            this.el.btnStartGame.addEventListener('click', () => {
                const nameVal = this.el.studentNameInput.value.trim();
                if (nameVal) this.studentName = nameVal;
                if (window.soundEngine) window.soundEngine.playPop();
                this.goToStage(1);
            });
        }

        // 사운드 토글
        if (this.el.btnSoundToggle) {
            this.el.btnSoundToggle.addEventListener('click', () => {
                const isMuted = window.soundEngine.toggleMute();
                this.el.soundIcon.textContent = isMuted ? '🔇' : '🔊';
            });
        }

        // 치트시트 열기/닫기
        if (this.el.btnCheatSheet) {
            this.el.btnCheatSheet.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.playPop();
                this.openCheatSheet();
            });
        }
        if (this.el.btnCloseCheat) {
            this.el.btnCloseCheat.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.playPop();
                this.el.cheatSheetModal.style.display = 'none';
            });
        }

        // Stage 5 과학 랩 물리/화학 버튼
        if (this.el.btnLabPhysical) {
            this.el.btnLabPhysical.addEventListener('click', () => {
                this.cookingScience.handleStage5Answer('physical');
            });
        }
        if (this.el.btnLabChemical) {
            this.el.btnLabChemical.addEventListener('click', () => {
                this.cookingScience.handleStage5Answer('chemical');
            });
        }

        // 피드백 닫기 / 다음 버튼
        if (this.el.feedbackNextBtn) {
            this.el.feedbackNextBtn.addEventListener('click', () => {
                this.closeFeedback();
            });
        }

        // 다시 하기 & 인쇄
        if (this.el.btnRestartGame) {
            this.el.btnRestartGame.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.playPop();
                this.resetGame();
            });
        }
        if (this.el.btnPrintReceipt) {
            this.el.btnPrintReceipt.addEventListener('click', () => {
                window.print();
            });
        }
    }

    addScore(points) {
        this.score += points;
        this.combo++;
        if (this.el.scoreDisplay) {
            this.el.scoreDisplay.textContent = `${this.score}점`;
            this.el.scoreDisplay.classList.add('score-pop');
            setTimeout(() => this.el.scoreDisplay.classList.remove('score-pop'), 300);
        }
    }

    goToStage(stageNum) {
        this.currentStage = stageNum;

        // 모든 뷰 숨기기
        const views = [
            this.el.viewIntro,
            this.el.viewStage1,
            this.el.viewStage2,
            this.el.viewStage3,
            this.el.viewStage4,
            this.el.viewStage5,
            this.el.viewStage6,
            this.el.viewStage7,
            this.el.viewReceipt
        ];
        views.forEach(v => { if (v) v.classList.remove('active'); });

        // 프로그레스 바 표시 여부
        if (stageNum >= 1 && stageNum <= 7) {
            this.el.progressSection.style.display = 'block';
            const pct = ((stageNum - 1) / 6) * 100;
            this.el.progressBarFill.style.width = `${pct}%`;

            for (let i = 1; i <= 7; i++) {
                const ind = document.getElementById(`indicator-${i}`);
                if (ind) {
                    ind.classList.remove('active', 'completed');
                    if (i === stageNum) ind.classList.add('active');
                    else if (i < stageNum) ind.classList.add('completed');
                }
            }
        } else {
            this.el.progressSection.style.display = 'none';
        }

        // 해당 스테이지 뷰 활성화
        switch (stageNum) {
            case 1:
                this.el.viewStage1.classList.add('active');
                this.initStage1();
                break;
            case 2:
                this.el.viewStage2.classList.add('active');
                this.initStage2();
                break;
            case 3:
                this.el.viewStage3.classList.add('active');
                this.initStage3();
                break;
            case 4:
                this.el.viewStage4.classList.add('active');
                this.initStage4();
                break;
            case 5:
                this.el.viewStage5.classList.add('active');
                this.cookingScience.initStage5();
                break;
            case 6:
                this.el.viewStage6.classList.add('active');
                this.cookingScience.initStage6();
                break;
            case 7:
                this.el.viewStage7.classList.add('active');
                this.initStage7();
                break;
            case 8:
                this.el.viewReceipt.classList.add('active');
                this.renderReceipt();
                break;
            default:
                this.el.viewIntro.classList.add('active');
                break;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 피드백 모달
    showFeedback(isCorrect, title, desc, onNext) {
        this.el.feedbackIcon.textContent = isCorrect ? '🎉' : '💡';
        this.el.feedbackTitle.textContent = title;
        this.el.feedbackTitle.className = `feedback-title ${isCorrect ? 'correct' : 'wrong'}`;
        this.el.feedbackDesc.innerHTML = desc;
        this.onFeedbackNext = onNext;
        this.el.feedbackModal.style.display = 'flex';
    }

    closeFeedback() {
        this.el.feedbackModal.style.display = 'none';
        if (this.onFeedbackNext) {
            const cb = this.onFeedbackNext;
            this.onFeedbackNext = null;
            cb();
        }
    }

    // =========================================================
    // STAGE 1: 해썹(HACCP) 마트 식품 안전 장보기 순서 & 함정 라벨 판별
    // =========================================================
    initStage1() {
        this.currentOrderStep = 1;
        this.packedItems = [];
        this.renderStage1();
    }

    renderStage1() {
        const steps = window.GAME_DATA.shoppingOrder.steps;
        const currentTarget = steps.find(s => s.step === this.currentOrderStep);

        this.el.stage1Counter.textContent = `순서 ${this.currentOrderStep} / 5`;
        if (currentTarget) {
            this.el.targetCategoryName.textContent = `현재 담아야 할 단계: ${currentTarget.category}`;
            this.el.targetCategoryDesc.textContent = currentTarget.desc;
        }

        // 5단계 필 인디케이터
        this.el.orderPillsContainer.innerHTML = steps.map(s => `
            <div class="order-step-pill ${s.step === this.currentOrderStep ? 'active' : (s.step < this.currentOrderStep ? 'done' : '')}">
                <span>${s.step < this.currentOrderStep ? '✅' : `${s.step}단계`}</span>
                <span>${s.category}</span>
            </div>
        `).join('');

        // 진열대 아이템 렌더링
        const pool = window.GAME_DATA.shoppingOrder.pool;
        this.el.shelfItemsGrid.innerHTML = pool.map(item => {
            const isPacked = this.packedItems.includes(item.id);
            return `
                <div class="shelf-product-card ${isPacked ? 'packed' : ''} ${item.isTrap ? 'trap-style' : ''}" data-item-id="${item.id}">
                    <div class="product-icon-wrap">${item.icon}</div>
                    <div class="product-name">${item.name}</div>
                    <div class="product-tags">
                        <span class="p-temp">${item.temp}</span>
                        <span class="p-cat">${item.category}</span>
                    </div>
                </div>
            `;
        }).join('');

        // 진열대 클릭 이벤트 바인딩
        const cards = this.el.shelfItemsGrid.querySelectorAll('.shelf-product-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const itemId = card.getAttribute('data-item-id');
                this.handleStage1Click(itemId);
            });
        });

        // 카트 렌더링
        this.renderCart();
    }

    handleStage1Click(itemId) {
        const item = window.GAME_DATA.shoppingOrder.pool.find(i => i.id === itemId);
        if (!item || this.packedItems.includes(itemId)) return;

        const steps = window.GAME_DATA.shoppingOrder.steps;
        const currentTarget = steps.find(s => s.step === this.currentOrderStep);

        // 1. 함정 상품 클릭 시
        if (item.isTrap) {
            if (window.soundEngine) window.soundEngine.playWrong();
            this.showFeedback(
                false,
                "🚨 해썹(HACCP) 마트 안전 경보 발령!",
                `<strong>위험 상품 선택 감지!</strong><br>${item.trapReason}<br><br><span style="color:#DC2626;">안전한 정품 식재료만 카트에 담아주세요!</span>`,
                () => {}
            );
            return;
        }

        // 2. 현재 단계의 올바른 식품 클릭 시 (step 번호 또는 카테고리 일치)
        const isMatch = (item.step !== undefined && item.step === currentTarget.step) ||
            (item.category === currentTarget.category) ||
            (currentTarget.category && currentTarget.category.includes(item.category)) ||
            (item.category && item.category.includes(currentTarget.category));

        if (isMatch) {
            this.packedItems.push(item.id);
            this.addScore(20);
            if (window.soundEngine) window.soundEngine.playCartAdd();

            this.currentOrderStep++;
            if (this.currentOrderStep > 5) {
                // 1단계 완료
                this.stageScores.stage1 = 100;
                if (window.soundEngine) window.soundEngine.playCorrect();
                this.showFeedback(
                    true,
                    "🎉 해썹 마트 장보기 완벽 성공!",
                    `<strong>실온 ➔ 농산물 ➔ 냉장·냉동 ➔ 육류 ➔ 어패류</strong>의 안전 장보기 5단계 순서를 지키고 위해요소 함정을 모두 피했습니다!<br>이제 [신선 식재료 감별 탐정소]로 이동합니다.`,
                    () => {
                        this.goToStage(2);
                    }
                );
            } else {
                this.renderStage1();
            }
        } else {
            // 순서가 틀린 상품 클릭 시
            if (window.soundEngine) window.soundEngine.playWrong();
            this.showFeedback(
                false,
                "장보기 순서가 올바르지 않습니다!",
                `현재 단계는 <strong>[${currentTarget.category}]</strong>를 담을 차례입니다.<br>선택하신 [${item.name}]은(는) <em>${item.category}</em>에 해당합니다. 실온 식품부터 차례대로 담아야 세균 번식과 신선도 저하를 막을 수 있습니다!`,
                () => {}
            );
        }
    }

    renderCart() {
        const pool = window.GAME_DATA.shoppingOrder.pool;
        const packedObjList = this.packedItems.map(id => pool.find(i => i.id === id)).filter(Boolean);

        this.el.cartCount.textContent = `담은 상품: ${packedObjList.length}개 / 5단계`;
        if (packedObjList.length === 0) {
            this.el.cartItemsRow.innerHTML = `
                <span style="color:#B45309; font-size:0.85rem; align-self:center;">카트가 비어있습니다. 올바른 순서의 상품을 위 진열대에서 클릭하세요!</span>
            `;
        } else {
            this.el.cartItemsRow.innerHTML = packedObjList.map((item, idx) => `
                <div class="cart-pill-item">
                    <span>${idx + 1}️⃣ ${item.icon}</span>
                    <span class="p-name">${item.name}</span>
                </div>
            `).join('');
        }
    }

    // =========================================================
    // STAGE 2: 신선 식재료 감별 탐정소
    // =========================================================
    initStage2() {
        this.inspectorList = [...window.GAME_DATA.ingredientInspector];
        this.inspectorIndex = 0;
        this.renderStage2();
    }

    renderStage2() {
        const item = this.inspectorList[this.inspectorIndex];
        if (!item) {
            this.stageScores.stage2 = 120;
            this.showFeedback(
                true,
                "🎉 신선 식재료 감별 마스터!",
                "생선, 로컬푸드, 쌀, 우유, 달걀, 기름의 신선도 판별 기준을 모두 통과했습니다!<br>이제 [인증 마크 스피드 매칭]으로 이동합니다.",
                () => {
                    this.goToStage(3);
                }
            );
            return;
        }

        this.el.stage2Progress.textContent = `${this.inspectorIndex + 1} / ${this.inspectorList.length}`;
        this.el.inspectorFoodTitle.textContent = item.title;
        this.el.inspectorQuestion.textContent = item.question;
        this.el.inspectorTipText.textContent = item.tip;

        // 2지선다 옵션 렌더링
        this.el.inspectorOptionsContainer.innerHTML = item.options.map((opt, idx) => `
            <div class="inspector-choice-card" data-opt-idx="${idx}">
                <div class="choice-marker">${idx === 0 ? 'A' : 'B'}</div>
                <div class="choice-text">${opt.text}</div>
            </div>
        `).join('');

        const choiceCards = this.el.inspectorOptionsContainer.querySelectorAll('.inspector-choice-card');
        choiceCards.forEach(card => {
            card.addEventListener('click', () => {
                const optIdx = parseInt(card.getAttribute('data-opt-idx'), 10);
                this.handleStage2Choice(optIdx);
            });
        });
    }

    handleStage2Choice(optionIndex) {
        const item = this.inspectorList[this.inspectorIndex];
        const selectedOpt = item.options[optionIndex];

        if (selectedOpt.isCorrect) {
            this.addScore(20);
            if (window.soundEngine) window.soundEngine.playCorrect();
            this.showFeedback(
                true,
                "정답입니다!",
                selectedOpt.feedback,
                () => {
                    this.inspectorIndex++;
                    this.renderStage2();
                }
            );
        } else {
            if (window.soundEngine) window.soundEngine.playWrong();
            this.showFeedback(
                false,
                "아쉬워요! 다시 확인해 보세요.",
                selectedOpt.feedback,
                () => {
                    this.inspectorIndex++;
                    this.renderStage2();
                }
            );
        }
    }

    // =========================================================
    // STAGE 3: 친환경·안전 인증 마크 스피드 매칭
    // =========================================================
    initStage3() {
        this.certList = window.GAME_DATA.certifications.filter(c => c.id !== 'fake_trap');
        // 셔플
        this.certList.sort(() => Math.random() - 0.5);
        this.certIndex = 0;
        this.renderStage3();
    }

    renderStage3() {
        const currentCert = this.certList[this.certIndex];
        if (!currentCert) {
            this.stageScores.stage3 = 120;
            this.showFeedback(
                true,
                "🎉 인증 마크 마스터!",
                "HACCP, GAP, 친환경 유기농, 무농약, 무항생제, 동물복지 마크를 완벽히 구별했습니다!<br>이제 [셰프의 정육점]으로 이동합니다.",
                () => {
                    this.goToStage(4);
                }
            );
            return;
        }

        this.el.stage3Progress.textContent = `${this.certIndex + 1} / ${this.certList.length}`;
        this.el.certQuizClue.textContent = currentCert.quizClue;

        // 전체 마크 배지 + 가짜 함정 마크 배치
        const allCerts = [...window.GAME_DATA.certifications];
        allCerts.sort(() => Math.random() - 0.5);

        this.el.certBadgesGrid.innerHTML = allCerts.map(c => `
            <button class="cert-btn-card" data-cert-id="${c.id}" style="border-color: ${c.color}">
                <div class="cert-badge-tag" style="background-color: ${c.color}">${c.badge}</div>
                <div class="cert-card-icon">${c.icon}</div>
                <div class="cert-card-name">${c.name}</div>
                <div class="cert-card-key">${c.keyword}</div>
            </button>
        `).join('');

        const certBtns = this.el.certBadgesGrid.querySelectorAll('.cert-btn-card');
        certBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const certId = btn.getAttribute('data-cert-id');
                this.handleStage3Choice(certId);
            });
        });
    }

    handleStage3Choice(selectedCertId) {
        const currentCert = this.certList[this.certIndex];

        if (selectedCertId === currentCert.id) {
            this.addScore(20);
            if (window.soundEngine) window.soundEngine.playCorrect();
            this.showFeedback(
                true,
                `정답! [${currentCert.name}]`,
                `<strong>${currentCert.name}</strong><br>${currentCert.desc}`,
                () => {
                    this.certIndex++;
                    this.renderStage3();
                }
            );
        } else {
            if (window.soundEngine) window.soundEngine.playWrong();
            const chosen = window.GAME_DATA.certifications.find(c => c.id === selectedCertId);
            this.showFeedback(
                false,
                "틀렸습니다! 정답을 확인하세요.",
                `선택하신 것은 <strong>${chosen ? chosen.name : '오답'}</strong>입니다.<br>정답은 <strong>[${currentCert.name}]</strong>입니다.<br>${currentCert.desc}`,
                () => {
                    this.certIndex++;
                    this.renderStage3();
                }
            );
        }
    }

    // =========================================================
    // STAGE 4: 셰프의 정육점 (부위별 명칭과 용도)
    // =========================================================
    initStage4() {
        this.chefOrders = [...window.GAME_DATA.chefOrders];
        this.chefOrderIndex = 0;

        if (!this.meatMap) {
            this.meatMap = new window.MeatMap('meatMapContainer', (partName, partId, animal) => {
                this.handleMeatPartSelect(partName, partId, animal);
            });
        }
        this.renderStage4();
    }

    renderStage4() {
        const order = this.chefOrders[this.chefOrderIndex];
        if (!order) {
            this.stageScores.stage4 = 120;
            this.showFeedback(
                true,
                "🎉 정육점 부위 매칭 완료!",
                "소, 돼지, 닭의 부위별 특징과 요리 용도를 완벽히 마스터하셨습니다!<br>이제 [조리 과학 랩: 물리적 vs 화학적 변화]로 이동합니다.",
                () => {
                    this.goToStage(5);
                }
            );
            return;
        }

        this.el.stage4Progress.textContent = `${this.chefOrderIndex + 1} / ${this.chefOrders.length}`;
        this.el.chefDishTitle.textContent = order.dish;
        this.el.chefOrderClue.textContent = order.clue;

        // 해당 동물의 탭으로 자동 전환
        this.meatMap.setAnimal(order.animal);
    }

    handleMeatPartSelect(partName, partId, animal) {
        const order = this.chefOrders[this.chefOrderIndex];
        if (!order) return;

        const isAnimalMatch = (animal === order.animal);
        const isPartMatch = order.targetNamesAlt.some(t => partName.includes(t) || t.includes(partName));

        if (isAnimalMatch && isPartMatch) {
            this.addScore(20);
            if (window.soundEngine) window.soundEngine.playCorrect();
            this.showFeedback(
                true,
                `완벽한 부위 선택! [${partName}]`,
                `<strong>${order.dish}</strong>에는 <strong>${partName}</strong>이(가) 가장 잘 어울립니다! 셰프님이 매우 만족해하십니다.`,
                () => {
                    this.chefOrderIndex++;
                    this.renderStage4();
                }
            );
        } else {
            if (window.soundEngine) window.soundEngine.playWrong();
            this.showFeedback(
                false,
                "이 요리에는 적합하지 않은 부위입니다!",
                `선택하신 부위: <strong>${partName}</strong><br>셰프의 주문 <strong>[${order.dish}]</strong>에 가장 적합한 부위는 <strong>[${order.targetName}]</strong>입니다.`,
                () => {
                    this.chefOrderIndex++;
                    this.renderStage4();
                }
            );
        }
    }

    // =========================================================
    // STAGE 7: 최종 골든벨 & 주방 안전 수칙
    // =========================================================
    initStage7() {
        this.goldenBellQuestions = [...window.GAME_DATA.goldenBell];
        this.goldenBellIndex = 0;
        this.renderStage7();
    }

    renderStage7() {
        const q = this.goldenBellQuestions[this.goldenBellIndex];
        if (!q) {
            this.stageScores.stage7 = 150;
            if (window.soundEngine) window.soundEngine.playFanfare();
            this.showFeedback(
                true,
                "🏆 전 코스 완벽 클리어!",
                `축하합니다! <strong>${this.studentName}</strong> 학생은 해썹 마트와 조리 과학 마스터 과정을 최고 등급으로 수료하셨습니다.<br>최종 영수증 성적표와 자격증을 확인하세요!`,
                () => {
                    this.goToStage(8);
                }
            );
            return;
        }

        this.el.stage7Progress.textContent = `${this.goldenBellIndex + 1} / ${this.goldenBellQuestions.length}`;
        this.el.goldenQuestionText.textContent = q.question;

        this.el.goldenChoicesGrid.innerHTML = q.options.map((opt, idx) => `
            <button class="golden-choice-btn" data-choice-idx="${idx}">
                <span class="choice-num">${idx + 1}</span>
                <span class="choice-label">${opt}</span>
            </button>
        `).join('');

        const btns = this.el.goldenChoicesGrid.querySelectorAll('.golden-choice-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const choiceIdx = parseInt(btn.getAttribute('data-choice-idx'), 10);
                this.handleStage7Choice(choiceIdx);
            });
        });
    }

    handleStage7Choice(choiceIndex) {
        const q = this.goldenBellQuestions[this.goldenBellIndex];
        const isCorrect = (choiceIndex === q.answer);

        if (isCorrect) {
            this.addScore(30);
            if (window.soundEngine) window.soundEngine.playCorrect();
            this.showFeedback(
                true,
                "골든벨 정답입니다!",
                `<strong>해설:</strong> ${q.explanation}`,
                () => {
                    this.goldenBellIndex++;
                    this.renderStage7();
                }
            );
        } else {
            if (window.soundEngine) window.soundEngine.playWrong();
            this.showFeedback(
                false,
                "아쉬워요! 골든벨 해설을 확인하세요.",
                `정답은 <strong>${q.answer + 1}번: ${q.options[q.answer]}</strong>입니다.<br><br><strong>해설:</strong> ${q.explanation}`,
                () => {
                    this.goldenBellIndex++;
                    this.renderStage7();
                }
            );
        }
    }

    // =========================================================
    // STAGE 8: 결과 영수증 성적표 & 1급 조리 과학 마스터 자격증
    // =========================================================
    renderReceipt() {
        if (window.soundEngine) {
            window.soundEngine.playStamp();
        }

        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (this.el.receiptDate) this.el.receiptDate.textContent = dateStr;
        if (this.el.receiptCustomer) this.el.receiptCustomer.textContent = `쇼퍼: ${this.studentName}`;
        if (this.el.certStudentName) this.el.certStudentName.textContent = this.studentName;

        if (this.el.resStage1) this.el.resStage1.textContent = `${this.stageScores.stage1}점 / 100점`;
        if (this.el.resStage2) this.el.resStage2.textContent = `${this.stageScores.stage2}점 / 120점`;
        if (this.el.resStage3) this.el.resStage3.textContent = `${this.stageScores.stage3}점 / 120점`;
        if (this.el.resStage4) this.el.resStage4.textContent = `${this.stageScores.stage4}점 / 120점`;
        if (this.el.resStage5) this.el.resStage5.textContent = `${this.stageScores.stage5}점 (물리/화학 랩)`;
        if (this.el.resStage6) this.el.resStage6.textContent = `${this.stageScores.stage6}점 (3대 요리 실습)`;
        if (this.el.resStage7) this.el.resStage7.textContent = `${this.stageScores.stage7}점 (주방안전 골든벨)`;

        const total = Object.values(this.stageScores).reduce((a, b) => a + b, 0);
        if (this.el.receiptTotalScore) this.el.receiptTotalScore.textContent = `${total}점`;
        if (this.el.certScoreBadge) this.el.certScoreBadge.textContent = `최종 획득: ${total}점 (S등급)`;

        let rankTitle = "1급 특급 마스터";
        if (total >= 900) rankTitle = "👑 국가공인 1급 조리과학 마스터";
        else if (total >= 700) rankTitle = "⭐ 우수 스마트 쇼퍼 & 셰프";
        else rankTitle = "🌱 꿈나무 조리 과학도";

        if (this.el.receiptRankTitle) this.el.receiptRankTitle.textContent = rankTitle;
    }

    openCheatSheet() {
        const sheet = window.GAME_DATA.teacherCheatSheet;
        this.el.cheatSheetList.innerHTML = sheet.summaryPoints.map(p => `
            <div class="cheat-item">
                <div class="cheat-topic">${p.topic}</div>
                <div class="cheat-text">${p.content.replace(/\n/g, '<br>')}</div>
            </div>
        `).join('');
        this.el.cheatSheetModal.style.display = 'flex';
    }

    resetGame() {
        this.score = 0;
        this.combo = 0;
        this.stageScores = {
            stage1: 0,
            stage2: 0,
            stage3: 0,
            stage4: 0,
            stage5: 0,
            stage6: 0,
            stage7: 0
        };
        if (this.el.scoreDisplay) this.el.scoreDisplay.textContent = '0점';
        this.goToStage(0);
    }
}

// 브라우저 로드 시 안전한 게임 인스턴스 초기화 (DOMContentLoaded 이미 완료된 경우 대응)
function initSmartMartMaster() {
    if (!window.game) {
        window.game = new SmartMartMasterGame();
        console.log("HACCP Cooking Master Game Initialized successfully!");
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initSmartMartMaster);
} else {
    initSmartMartMaster();
}
