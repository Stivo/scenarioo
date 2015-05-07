/* scenarioo-server
 * Copyright (C) 2015, scenarioo.org Development Team
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package org.scenarioo.model.design.aggregates;

import org.scenarioo.model.design.entities.Proposal;

public class ProposalSummary {

	private Proposal proposal;
	private int numberOfSteps;

	public Proposal getProposal() {
		return proposal;
	}

	public void setProposal(final Proposal proposal) {
		this.proposal = proposal;
	}

	public int getNumberOfSteps() {
		return numberOfSteps;
	}

	public void setNumberOfSteps(final int numberOfSteps) {
		this.numberOfSteps = numberOfSteps;
	}

}