// 조리 과학 랩 (물리적 vs 화학적 변화) & 3대 교과서 실습 요리 시뮬레이터 컨트롤러

class CookingScienceController {
    constructor(gameInstance) {
        this.game = gameInstance;
        
        // Stage 5 (Science Lab) State
        this.labCardIndex = 0;
        this.labCards = [];
        this.labCorrectCount = 0;

        // Stage 6 (Cooking Simulators) State
        this.currentDishIndex = 0;
        this.currentDishStep = 0;
        this.dishes = [];
        this.dishScores = { sujebi: 0, galbijim: 0, fish_pancake: 0 };
    }

    // =========================================================
    // STAGE 5: 조리 과학 랩 (물리적 변화 vs 화학적 변화 스피드 분류)
    // =========================================================
    initStage5() {
        this.labCards = [...window.GAME_DATA.scienceLab.cards];
        // 셔플
        this.labCards.sort(() => Math.random() - 0.5);
        this.labCardIndex = 0;
        this.labCorrectCount = 0;
        this.renderStage5();
    }

    renderStage5() {
        const card = this.labCards[this.labCardIndex];
        const progressEl = document.getElementById('stage5LabProgress');
        const cardContainer = document.getElementById('labCardContainer');
        const counterTotal = this.labCards.length;

        if (progressEl) {
            progressEl.textContent = `${this.labCardIndex + 1} / ${counterTotal}`;
        }

        if (!card) {
            this.finishStage5();
            return;
        }

        if (cardContainer) {
            cardContainer.innerHTML = `
                <div class="science-flip-card active" id="currentScienceCard">
                    <div class="science-card-badge">조리 현상 관찰 #${this.labCardIndex + 1}</div>
                    <div class="science-card-body">
                        <div class="science-card-icon">${card.type === 'physical' ? '🧊' : '🧪'}</div>
                        <h3 class="science-phenomenon-text">${card.text}</h3>
                        <p class="science-hint-sub">이 현상은 성분 변화가 없는 <strong>물리적 변화</strong>일까요?<br>새 성분이 생기는 <strong>화학적 변화</strong>일까요?</p>
                    </div>
                </div>
            `;
        }
    }

    handleStage5Answer(selectedType) {
        const card = this.labCards[this.labCardIndex];
        if (!card) return;

        const isCorrect = (selectedType === card.type);
        const cardEl = document.getElementById('currentScienceCard');

        if (isCorrect) {
            this.labCorrectCount++;
            this.game.addScore(25);
            if (window.soundEngine) window.soundEngine.playCorrect();

            if (cardEl) {
                cardEl.classList.add(selectedType === 'physical' ? 'slide-left-pass' : 'slide-right-pass');
            }

            this.game.showFeedback(
                true,
                `정답! [${card.type === 'physical' ? '물리적 변화' : '화학적 변화'}]`,
                `<strong>과학 개념: ${card.scienceTerm}</strong><br>${card.desc}`,
                () => {
                    this.labCardIndex++;
                    this.renderStage5();
                }
            );
        } else {
            if (window.soundEngine) window.soundEngine.playWrong();
            if (cardEl) {
                cardEl.classList.add('shake-card');
                setTimeout(() => cardEl.classList.remove('shake-card'), 500);
            }

            const correctLabel = card.type === 'physical' ? '물리적 변화' : '화학적 변화';
            this.game.showFeedback(
                false,
                `아쉬워요! 이것은 [${correctLabel}]입니다.`,
                `<strong>과학 개념: ${card.scienceTerm}</strong><br>${card.desc}`,
                () => {
                    this.labCardIndex++;
                    this.renderStage5();
                }
            );
        }
    }

    finishStage5() {
        this.game.stageScores.stage5 = this.labCorrectCount * 25;
        this.game.showFeedback(
            true,
            "🎉 조리 과학 랩 통과!",
            `총 ${this.labCards.length}개 중 ${this.labCorrectCount}개 현상의 과학 원리를 정확히 분류했습니다! 이제 3대 교과서 실습 요리 시뮬레이터로 이동합니다.`,
            () => {
                this.game.goToStage(6);
            }
        );
    }

    // =========================================================
    // STAGE 6: 3대 교과서 실습 요리 & 과학 원리 시뮬레이터
    // =========================================================
    initStage6() {
        this.dishes = window.GAME_DATA.cookingSimulators;
        this.currentDishIndex = 0;
        this.currentDishStep = 0;
        this.dishScores = { sujebi: 0, galbijim: 0, fish_pancake: 0 };
        this.renderStage6();
    }

    renderStage6() {
        const dish = this.dishes[this.currentDishIndex];
        if (!dish) {
            this.finishStage6();
            return;
        }

        const step = dish.steps[this.currentDishStep];
        const dishHeader = document.getElementById('dishHeaderTitle');
        const dishBadge = document.getElementById('dishHeaderBadge');
        const dishDesc = document.getElementById('dishHeaderDesc');
        const dishStepIndicator = document.getElementById('dishStepIndicator');
        const dishInteractiveArea = document.getElementById('dishInteractiveArea');
        const progressEl = document.getElementById('stage6Progress');

        if (progressEl) {
            progressEl.textContent = `요리 ${this.currentDishIndex + 1}/3 (단계 ${this.currentDishStep + 1}/3)`;
        }

        if (dishHeader) dishHeader.textContent = dish.title;
        if (dishBadge) dishBadge.textContent = dish.badge;
        if (dishDesc) dishDesc.textContent = dish.desc;

        // 요리 탭 및 단계 표시
        if (dishStepIndicator) {
            dishStepIndicator.innerHTML = dish.steps.map((s, idx) => `
                <div class="dish-step-pill ${idx === this.currentDishStep ? 'active' : (idx < this.currentDishStep ? 'completed' : '')}">
                    <span>${idx < this.currentDishStep ? '✅' : `${idx + 1}단계`}</span>
                    <span>${s.actionTitle}</span>
                </div>
            `).join('');
        }

        if (dishInteractiveArea && step) {
            // 요리별 비주얼 테마
            let visualIcon = '🍲';
            if (dish.dishId === 'sujebi') visualIcon = '🥣';
            else if (dish.dishId === 'galbijim') visualIcon = '🥩';
            else if (dish.dishId === 'fish_pancake') visualIcon = '🍳';

            dishInteractiveArea.innerHTML = `
                <div class="cook-sim-card">
                    <div class="cook-sim-top">
                        <div class="cook-avatar-icon">${visualIcon}</div>
                        <div class="cook-prompt-box">
                            <span class="step-num-tag">STEP ${step.stepNum}. ${step.actionTitle}</span>
                            <h3 class="step-prompt-text">${step.prompt}</h3>
                        </div>
                    </div>

                    <div class="cook-options-grid">
                        ${step.options.map((opt, oIdx) => `
                            <button class="cook-opt-btn" data-opt-idx="${oIdx}">
                                <span class="opt-num-badge">${oIdx + 1}</span>
                                <span class="opt-text">${opt.text}</span>
                            </button>
                        `).join('')}
                    </div>

                    <div class="cook-science-note">
                        <span>🔬 <strong>핵심 과학 포인트:</strong> ${step.scienceTip}</span>
                    </div>
                </div>
            `;

            // 옵션 클릭 바인딩
            const optBtns = dishInteractiveArea.querySelectorAll('.cook-opt-btn');
            optBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const optIdx = parseInt(btn.getAttribute('data-opt-idx'), 10);
                    this.handleStage6Step(optIdx);
                });
            });
        }
    }

    handleStage6Step(optionIndex) {
        const dish = this.dishes[this.currentDishIndex];
        if (!dish) return;
        const step = dish.steps[this.currentDishStep];
        if (!step) return;

        const selectedOpt = step.options[optionIndex];
        const isCorrect = selectedOpt && selectedOpt.isCorrect;

        // 요리별 효과음 재생
        if (window.soundEngine) {
            if (dish.dishId === 'sujebi') window.soundEngine.playKnead();
            else if (dish.dishId === 'fish_pancake') window.soundEngine.playSizzle();
            else window.soundEngine.playPop();
        }

        if (isCorrect) {
            this.game.addScore(40);
            if (window.soundEngine) window.soundEngine.playCorrect();

            this.game.showFeedback(
                true,
                `훌륭한 조리 과학 적용! (${step.actionTitle})`,
                `<strong>${dish.title} - ${step.actionTitle} 성공!</strong><br>${step.scienceTip}`,
                () => {
                    this.advanceDishStep();
                }
            );
        } else {
            if (window.soundEngine) window.soundEngine.playWrong();

            this.game.showFeedback(
                false,
                `조리 과정 주의! (${step.actionTitle})`,
                `<strong>올바른 원리 확인:</strong><br>${step.scienceTip}`,
                () => {
                    this.advanceDishStep();
                }
            );
        }
    }

    advanceDishStep() {
        const dish = this.dishes[this.currentDishIndex];
        this.currentDishStep++;

        if (this.currentDishStep >= dish.steps.length) {
            // 해당 요리 완성!
            this.currentDishIndex++;
            this.currentDishStep = 0;

            if (this.currentDishIndex >= this.dishes.length) {
                this.finishStage6();
            } else {
                if (window.soundEngine) window.soundEngine.playFanfare();
                this.game.showFeedback(
                    true,
                    `🎉 ${dish.title} 완성!`,
                    `훌륭합니다! 교과서에 수록된 과학 원리를 완벽하게 적용하여 요리를 멋지게 완성했습니다. 다음 요리 실습으로 넘어갑니다!`,
                    () => {
                        this.renderStage6();
                    }
                );
            }
        } else {
            this.renderStage6();
        }
    }

    finishStage6() {
        this.game.stageScores.stage6 = 360; // 9단계 * 40점
        this.game.showFeedback(
            true,
            "🏆 3대 실습 요리 마스터 등극!",
            `수제비(글루텐), 갈비찜(연육 & 모서리 깎기), 생선전(달걀 결합성 & 응고성)의 조리 과학 원리를 모두 마스터하셨습니다!<br>마지막 단계인 [주방 안전 & 최종 골든벨]로 이동합니다.`,
            () => {
                this.game.goToStage(7);
            }
        );
    }
}

window.CookingScienceController = CookingScienceController;
